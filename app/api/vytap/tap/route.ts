import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyWalletSignature } from '@/lib/auth';

// Helper function to update streak
async function updateStreak(client: any, userId: number) {
  const today = new Date().toISOString().split('T')[0];
  
  const streakResult = await client.query(
    'SELECT current_streak, last_tap_date FROM user_streaks WHERE user_id = $1',
    [userId]
  );

  if (streakResult.rows.length === 0) {
    // Create new streak
    await client.query(
      'INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_tap_date) VALUES ($1, 1, 1, $2)',
      [userId, today]
    );
  } else {
    const lastDate = streakResult.rows[0].last_tap_date?.toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    
    if (lastDate === yesterdayStr) {
      // Consecutive day
      newStreak = streakResult.rows[0].current_streak + 1;
    } else if (lastDate === today) {
      // Same day, keep streak
      newStreak = streakResult.rows[0].current_streak;
    }
    // else: streak broken, reset to 1

    await client.query(
      `UPDATE user_streaks 
       SET current_streak = $1, 
           longest_streak = GREATEST(longest_streak, $1),
           last_tap_date = $2
       WHERE user_id = $3`,
      [newStreak, today, userId]
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, sessionSignature, sessionMessage, signature, message } = body;
    
    const sig = sessionSignature || signature;
    const msg = sessionMessage || message;

    // Verify wallet signature
    const verifyResult = await verifyWalletSignature(walletAddress, sig, msg, !!sessionSignature);
    
    if (!verifyResult.success) {
      return NextResponse.json(
        { success: false, error: verifyResult.error },
        { status: 401 }
      );
    }

    // Verify tap timing (prevent spam)
    const lastTapResult = await db.query(
      'SELECT last_tap_at FROM users WHERE wallet_address = $1',
      [walletAddress]
    );
    
    if (lastTapResult.rows.length > 0 && lastTapResult.rows[0].last_tap_at) {
      const lastTap = new Date(lastTapResult.rows[0].last_tap_at).getTime();
      const now = Date.now();
      const cooldown = 200; // 200ms cooldown for faster tapping
      
      if ((now - lastTap) < cooldown) {
        return NextResponse.json({
          success: false,
          error: 'Tap too quickly. Please wait.',
          retryAfter: cooldown - (now - lastTap)
        }, { status: 429 });
      }
    }

    // Fixed 1 point per tap
    const pointsEarned = 1;

    // Start transaction
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Get or create user
      let userResult = await client.query(
        'SELECT id, total_points FROM users WHERE wallet_address = $1',
        [walletAddress]
      );

      let userId: number;
      let newTotal: number;

      if (userResult.rows.length === 0) {
        // Create new user
        const createResult = await client.query(
          'INSERT INTO users (wallet_address, total_points, last_tap_at) VALUES ($1, $2, NOW()) RETURNING id, total_points',
          [walletAddress, pointsEarned]
        );
        userId = createResult.rows[0].id;
        newTotal = pointsEarned;
      } else {
        // Update existing user
        userId = userResult.rows[0].id;
        const updateResult = await client.query(
          'UPDATE users SET total_points = total_points + $1, last_tap_at = NOW() WHERE id = $2 RETURNING total_points',
          [pointsEarned, userId]
        );
        newTotal = updateResult.rows[0].total_points;
      }

      // Record tap history
      await client.query(
        'INSERT INTO tap_history (user_id, points_earned) VALUES ($1, $2)',
        [userId, pointsEarned]
      );

      // Update streak
      await updateStreak(client, userId);

      // Get new rank
      const rankResult = await client.query(
        'SELECT COUNT(*) + 1 as rank FROM users WHERE total_points > $1',
        [newTotal]
      );

      // Get current streak
      const streakResult = await client.query(
        'SELECT current_streak FROM user_streaks WHERE user_id = $1',
        [userId]
      );

      await client.query('COMMIT');
      client.release();

      return NextResponse.json({
        success: true,
        data: {
          pointsEarned,
          totalPoints: newTotal,
          newRank: parseInt(rankResult.rows[0].rank),
          streak: streakResult.rows[0]?.current_streak || 0
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      throw error;
    }
  } catch (error) {
    console.error('Tap error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process tap' },
      { status: 500 }
    );
  }
}
