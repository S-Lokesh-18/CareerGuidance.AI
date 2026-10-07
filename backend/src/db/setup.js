import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client, Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSetup() {
  const connectionUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/career_portal';
  console.log(`Connecting to database URL: ${connectionUrl.replace(/:[^:@]+@/, ':****@')}`);

  let parsedUrl;
  try {
    parsedUrl = new URL(connectionUrl);
  } catch (err) {
    console.error('Invalid DATABASE_URL format.');
    process.exit(1);
  }

  const targetDbName = parsedUrl.pathname.replace(/^\//, '') || 'career_portal';

  // 1. Try to ensure target database exists by connecting to default postgres DB
  try {
    const adminUrl = new URL(connectionUrl);
    adminUrl.pathname = '/postgres';

    const client = new Client({ connectionString: adminUrl.toString() });
    await client.connect();

    const checkRes = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDbName]
    );

    if (checkRes.rowCount === 0) {
      console.log(`Database "${targetDbName}" does not exist. Creating it now...`);
      // Escape identifier safely
      await client.query(`CREATE DATABASE "${targetDbName}"`);
      console.log(`Database "${targetDbName}" created successfully.`);
    } else {
      console.log(`Database "${targetDbName}" already exists.`);
    }

    await client.end();
  } catch (err) {
    console.warn(`Could not verify/create database via admin connection: ${err.message}. Will try direct connection.`);
  }

  // 2. Connect to the target database and execute schema.sql & seed.sql
  const targetPool = new Pool({ connectionString: connectionUrl });

  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    console.log('Applying schema.sql...');
    await targetPool.query(schemaSql);
    console.log('✓ Schema created/verified successfully.');

    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    console.log('Applying seed.sql...');
    await targetPool.query(seedSql);
    console.log('✓ Seed data (10 careers) loaded successfully.');

    const careerCountRes = await targetPool.query('SELECT COUNT(*) FROM careers');
    console.log(`Total careers currently in database: ${careerCountRes.rows[0].count}`);

    console.log('\nDatabase setup finished successfully! 🎉');
  } catch (err) {
    console.error('Database setup failed:', err.message);
    process.exit(1);
  } finally {
    await targetPool.end();
  }
}

runSetup();
