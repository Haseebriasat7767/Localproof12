const { Pool } = require('pg');

// On Vercel/Lambda each concurrent instance gets its own module scope, and so
// its own pool. A pool of 10 across 20 warm instances is 200 connections,
// which exhausts a typical Postgres limit. Long-lived servers (Railway, local)
// keep a normal pool.
const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
  max: isServerless ? 1 : 10,
  // Release idle connections quickly on serverless so a frozen instance does
  // not hold one open.
  idleTimeoutMillis: isServerless ? 1000 : 30000,
  connectionTimeoutMillis: 10000
});

// An idle client dropped by the database emits 'error' on the pool. Unhandled,
// that takes down the process.
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
});

const SCHEMA = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      business_name VARCHAR(255) DEFAULT '',
      plan VARCHAR(50) DEFAULT 'free',
      stripe_customer_id VARCHAR(255) DEFAULT '',
      stripe_subscription_id VARCHAR(255) DEFAULT '',
      google_connected BOOLEAN DEFAULT false,
      google_tokens JSONB DEFAULT NULL,
      tone VARCHAR(50) DEFAULT 'professional',
      trial_ends_at TIMESTAMP DEFAULT NOW() + INTERVAL '14 days',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      platform VARCHAR(50) NOT NULL,
      review_id VARCHAR(255) NOT NULL,
      author_name VARCHAR(255) DEFAULT 'Anonymous',
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      text TEXT DEFAULT '',
      date TIMESTAMP DEFAULT NOW(),
      replied BOOLEAN DEFAULT false,
      reply_text TEXT DEFAULT '',
      reply_draft TEXT DEFAULT '',
      sentiment VARCHAR(50) DEFAULT 'neutral',
      is_fake_suspected BOOLEAN DEFAULT false,
      fake_reasons TEXT[] DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, review_id)
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      customer_name VARCHAR(255) DEFAULT 'Anonymous',
      customer_email VARCHAR(255) DEFAULT '',
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT DEFAULT '',
      is_unhappy BOOLEAN DEFAULT false,
      alert_sent BOOLEAN DEFAULT false,
      source VARCHAR(50) DEFAULT 'widget',
      created_at TIMESTAMP DEFAULT NOW()
    );
`;

// Applies the schema unconditionally. Used by `npm run migrate`.
async function applySchema() {
  await pool.query(SCHEMA);
  console.log('Database schema initialized');
}

let initPromise = null;

// Memoised so the schema round-trip happens at most once per process, and
// skippable once the schema is managed by an explicit migration step —
// on serverless that saves a round-trip on every cold start.
function initDb() {
  if (initPromise) return initPromise;

  initPromise = process.env.SKIP_DB_INIT === '1'
    ? Promise.resolve()
    : applySchema();

  return initPromise;
}

module.exports = { pool, initDb, applySchema, SCHEMA };
