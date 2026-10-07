import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/career_portal';

const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_SSL === 'true' || process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client:', err.message);
});

export const query = (text, params) => pool.query(text, params);
export default pool;
