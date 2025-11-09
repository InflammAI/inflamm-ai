import { Pool } from 'pg';

// Singleton pool for serverless
let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10, // Reduced for serverless
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err: Error) => {
      console.error('Unexpected database error:', err);
    });
  }
  return pool;
}

export const query = async (text: string, params?: any[]) => {
  const pool = getPool();
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const getClient = async () => {
  const pool = getPool();
  return await pool.connect();
};

export default { query, getClient };
