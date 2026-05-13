const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL || '';
const isLocalDb = /@(localhost|127\.0\.0\.1)(:\d+)?\//i.test(databaseUrl);
const sslMode = (process.env.PGSSLMODE || '').toLowerCase();
const disableSsl = isLocalDb || process.env.DB_SSL === 'false' || sslMode === 'disable';

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: disableSsl ? false : { rejectUnauthorized: false }
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS checkins (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL UNIQUE,
      tasks_done TEXT[] DEFAULT '{}',
      coins INTEGER DEFAULT 0,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('DB ready');
}

module.exports = { pool, initDB };
