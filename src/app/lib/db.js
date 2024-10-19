import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : 5432,
  ssl: {
    rejectUnauthorized: false,  // 使用 SSL，但不验证自签名证书
  },
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = async (text, params) => {
  try {
    return await pool.query(text, params);
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};