import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fueleu_maritime',
});

async function migrate() {
  try {
    console.log('Running database migrations...');
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schema);
    console.log('✅ Migrations completed successfully');
    await pool.end();
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    await pool.end();
    process.exit(1);
  }
}

migrate();


