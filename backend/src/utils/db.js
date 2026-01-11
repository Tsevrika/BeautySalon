import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

console.log('DB CONNECT:', process.env.DATABASE_URL);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false}
});
