const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function initDb() {
  await pool.query(`
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
  `);
  console.log('Database schema initialized');
}

module.exports = { pool, initDb };
