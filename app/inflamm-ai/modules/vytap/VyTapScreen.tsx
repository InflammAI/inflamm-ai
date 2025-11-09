'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { API_ENDPOINTS } from '../../config/api';

export const VyTapScreen: React.FC = () => {
  const { publicKey, connected, signMessage } = useWallet();
  const [tapCount, setTapCount] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0); // Points earned this session
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Timer states
  const [timerStatus, setTimerStatus] = useState<'ready' | 'cooldown'>('ready');
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [pointsLimit] = useState(300); // 300 points before cooldown
  const [pointsUntilCooldown, setPointsUntilCooldown] = useState(300);
  
  // Session signature - stored after first sign
  const [sessionSignature, setSessionSignature] = useState<string | null>(null);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  // Load persisted state on mount
  useEffect(() => {
    if (publicKey && !mounted) {
      const walletKey = publicKey.toString();
      const savedState = localStorage.getItem(`vytap_state_${walletKey}`);
      
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          
          // Restore points and timer state
          setPointsUntilCooldown(parsed.pointsUntilCooldown ?? 300);
          setSessionPoints(parsed.sessionPoints ?? 0);
          
          // Restore cooldown timer if still active
          if (parsed.timerStatus === 'cooldown' && parsed.cooldownEndTime) {
            const now = Date.now();
            const remainingTime = Math.max(0, Math.floor((parsed.cooldownEndTime - now) / 1000));
            
            if (remainingTime > 0) {
              setTimerStatus('cooldown');
              setTimeRemaining(remainingTime);
            } else {
              // Cooldown expired while away
              setTimerStatus('ready');
              setPointsUntilCooldown(300);
              setSessionPoints(0);
            }
          }
          
          // Restore session signature
          if (parsed.sessionSignature && parsed.sessionMessage) {
            setSessionSignature(parsed.sessionSignature);
            setSessionMessage(parsed.sessionMessage);
          }
        } catch (error) {
          console.error('Failed to load saved state:', error);
        }
      }
      
      setMounted(true);
    }
  }, [publicKey, mounted]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (publicKey && mounted) {
      const walletKey = publicKey.toString();
      const stateToSave = {
        pointsUntilCooldown,
        sessionPoints,
        timerStatus,
        cooldownEndTime: timerStatus === 'cooldown' ? Date.now() + (timeRemaining * 1000) : null,
        sessionSignature,
        sessionMessage,
        lastUpdated: Date.now()
      };
      
      localStorage.setItem(`vytap_state_${walletKey}`, JSON.stringify(stateToSave));
    }
  }, [publicKey, mounted, pointsUntilCooldown, sessionPoints, timerStatus, timeRemaining, sessionSignature, sessionMessage]);

  // Reset session when wallet disconnects
  useEffect(() => {
    if (!connected || !publicKey) {
      // Clear localStorage for old wallet
      if (publicKey) {
        localStorage.removeItem(`vytap_state_${publicKey.toString()}`);
      }
      // Reset session signature when wallet disconnects
      setSessionSignature(null);
      setSessionMessage(null);
      setSessionPoints(0);
      setPointsUntilCooldown(pointsLimit);
      setTimerStatus('ready');
      setTimeRemaining(0);
    }
  }, [connected, publicKey, pointsLimit]);

  // Cooldown countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerStatus === 'cooldown') {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Cooldown finished, back to ready
            setTimerStatus('ready');
            // Keep session signature active - no need to sign again!
            // Reset points counters to 300
            setSessionPoints(0);
            setPointsUntilCooldown(pointsLimit);
            
            // Update localStorage with reset state
            if (publicKey) {
              const walletKey = publicKey.toString();
              const stateToSave = {
                pointsUntilCooldown: pointsLimit,
                sessionPoints: 0,
                timerStatus: 'ready',
                cooldownEndTime: null,
                sessionSignature,
                sessionMessage,
                lastUpdated: Date.now()
              };
              localStorage.setItem(`vytap_state_${walletKey}`, JSON.stringify(stateToSave));
            }
            
            setToastMessage('✅ Ready to tap again!');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerStatus, pointsLimit, publicKey, sessionSignature, sessionMessage]);

  const handleTap = async () => {
    // Check if wallet is connected
    if (!connected || !publicKey || !signMessage) {
      setToastMessage('⚠️ Please connect your wallet first');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }

    // Check if in cooldown period
    if (timerStatus === 'cooldown') {
      setToastMessage(`⏸️ Cooldown: ${Math.floor(timeRemaining / 60)}:${String(timeRemaining % 60).padStart(2, '0')} remaining`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }

    // Check if reached points limit
    if (pointsUntilCooldown <= 0) {
      // Start 5-minute cooldown
      setTimerStatus('cooldown');
      setTimeRemaining(300); // 5 minutes = 300 seconds
      setToastMessage('⏸️ 300 points reached! 5-minute cooldown');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }

    setIsAnimating(true);
    
    try {
      let signatureToUse = sessionSignature;
      let messageToUse = sessionMessage;
      
      // Sign once on first tap if not already signed
      if (!signatureToUse || !messageToUse) {
        try {
          const sessionId = `session_${Date.now()}_${publicKey.toString()}`;
          const message = JSON.stringify({
            action: 'tap_session',
            walletAddress: publicKey.toString(),
            sessionId: sessionId
          });
          
          const messageBytes = new TextEncoder().encode(message);
          const signature = await signMessage(messageBytes);
          const signatureBase58 = bs58.encode(signature);
          
          // Store for entire session
          setSessionSignature(signatureBase58);
          setSessionMessage(message);
          signatureToUse = signatureBase58;
          messageToUse = message;
        } catch (signError) {
          console.error('Signature failed:', signError);
          setToastMessage('❌ Signature cancelled');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2000);
          setIsAnimating(false);
          return;
        }
      }
      
      // Call backend API with session signature + current tap timestamp
      const response = await fetch(API_ENDPOINTS.VYTAP.TAP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          sessionSignature: signatureToUse,
          sessionMessage: messageToUse,
          tapTimestamp: Date.now() // Current tap time, not part of signed message
        }),
      });

      // Update UI immediately (optimistic update)
      setTapCount(prev => prev + 1);
      setSessionPoints(prev => prev + 1);
      setPointsUntilCooldown(prev => prev - 1);
      
      // Check if this tap triggers cooldown
      const newPointsRemaining = pointsUntilCooldown - 1;
      if (newPointsRemaining === 0) {
        setToastMessage('🎯 300 points! Starting 5-min cooldown...');
      } else {
        setToastMessage('+1 Point');
      }
      setShowToast(true);
      
      const data = await response.json();
      
      if (data.success) {
        const { totalPoints } = data.data;
        
        // Update global balance
        if ((window as any).__updateVitalPoints) {
          (window as any).__updateVitalPoints(totalPoints);
        }
        
        // Refresh leaderboard
        if ((window as any).__refreshLeaderboard) {
          (window as any).__refreshLeaderboard();
        }
        
        // Trigger cooldown if reached limit
        if (newPointsRemaining === 0) {
          setTimeout(() => {
            setTimerStatus('cooldown');
            setTimeRemaining(300); // 5 minutes
          }, 1000);
        }
      } else {
        // Revert on error
        setTapCount(prev => prev - 1);
        setSessionPoints(prev => prev - 1);
        setPointsUntilCooldown(prev => prev + 1);
        setToastMessage(data.error || 'Tap failed');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }
      
      setTimeout(() => setShowToast(false), 1500);
      setTimeout(() => setIsAnimating(false), 150); // Faster animation for quick tapping
    } catch (error) {
      console.error('Tap failed:', error);
      setToastMessage('❌ Tap failed. Please try again.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      setIsAnimating(false);
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8">
      {/* Points Counter / Cooldown Display */}
      {timerStatus === 'ready' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 px-8 py-4 rounded-2xl border-2 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500"
          style={{
            borderImage: 'linear-gradient(to right, var(--accent-orange), var(--accent-yellow)) 1'
          }}
        >
          <div className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'var(--accent-orange)', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: 'var(--accent-yellow)', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#starGradient)" stroke="url(#starGradient)" strokeWidth="2"/>
            </svg>
            <div>
              <p className="font-bold text-lg bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-yellow)] bg-clip-text text-transparent">Vital Points Remaining</p>
              <p className="text-2xl font-mono bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-yellow)] bg-clip-text text-transparent">{pointsUntilCooldown} / {pointsLimit}</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 px-8 py-4 rounded-2xl border-2 bg-red-500/10 border-red-500"
        >
          <div className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2"/>
              <path d="M15 9L9 15M9 9L15 15" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div>
              <p className="text-red-500 font-bold text-lg">Cooldown Period</p>
              <p className="text-red-400 text-2xl font-mono">{formatTime(timeRemaining)}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tap button - Heart Icon */}
      <motion.button
        onClick={handleTap}
        disabled={timerStatus === 'cooldown'}
        className="relative focus:outline-none focus:ring-0 border-0 bg-transparent p-0 m-0"
        style={{ outline: 'none', border: 'none' }}
        whileHover={timerStatus !== 'cooldown' ? { scale: 1.08 } : {}}
        whileTap={timerStatus !== 'cooldown' ? { scale: 0.92 } : {}}
        animate={isAnimating ? { scale: [1, 1.12, 1] } : {}}
        transition={{ duration: 0.15 }}
      >
        {/* Glow effect */}
        <div className={`absolute inset-0 blur-3xl opacity-60 pointer-events-none ${
          timerStatus === 'cooldown' ? 'bg-gray-500' : ''
        }`} style={{
          background: timerStatus === 'cooldown' 
            ? 'rgb(107 114 128)' 
            : 'linear-gradient(135deg, var(--accent-orange), var(--accent-yellow))'
        }} />
        
        {/* Heart icon */}
        <div className="relative z-10">
          <svg
            width="280"
            height="280"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-all ${
              timerStatus === 'cooldown' ? 'opacity-50' : ''
            }`}
          >
            <defs>
              <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'var(--accent-orange)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'var(--accent-yellow)', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              fill={timerStatus === 'cooldown' ? '#6B7280' : 'url(#heartGradient)'}
              stroke={timerStatus === 'cooldown' ? '#4B5563' : '#F97316'}
              strokeWidth="0.5"
            />
          </svg>
          
          {/* TAP text overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-bold text-4xl ${
              timerStatus === 'cooldown' ? 'text-gray-300' : 'text-white'
            }`} style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              TAP
            </span>
          </div>
        </div>

        {/* Ripple effect */}
        {isAnimating && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <svg
              width="280"
              height="280"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                fill="none"
                stroke="#F97316"
                strokeWidth="1"
              />
            </svg>
          </motion.div>
        )}
      </motion.button>

      {/* Session Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 flex gap-8 text-center"
      >
        <div>
          <p className="text-[var(--muted)] text-sm">Session Points</p>
          <p className="text-white text-4xl font-bold tabular-nums">{sessionPoints}</p>
        </div>
        <div>
          <p className="text-[var(--muted)] text-sm">Total Taps</p>
          <p className="text-white text-4xl font-bold tabular-nums">{tapCount}</p>
        </div>
      </motion.div>

      {/* Toast notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-yellow)] text-white font-bold shadow-xl z-50"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
