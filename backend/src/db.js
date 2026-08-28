const { Pool } = require('pg');

// Managed Postgres providers each publish the connection string under their own
// name — Nile uses NILEDB_POSTGRES_URL, Vercel/Neon use POSTGRES_URL, Supabase
// and self-hosted setups use DATABASE_URL. Vercel Marketplace integrations also
// prefix them per store (e.g. iojio_NILEDB_POSTGRES_URL), so exact-name matching
// is not enough.
const CONNECTION_VARS = [
  'DATABASE_URL',
  'POSTGRES_URL_NON_POOLING',
  'POSTGRES_URL',
  'NILEDB_POSTGRES_URL',
  'NILEDB_URL'
];

// Only a real Postgres URL qualifies. This matters: providers ship sibling
// variables like NILEDB_API_URL holding an https:// endpoint, which would
// otherwise be picked up and fail at connect time.
const POSTGRES_URL = /^postgres(ql)?:\/\//i;
const DB_NAME_HINT = /(DATABASE|POSTGRES|NILEDB)/i;

function resolveConnectionString(env = process.env) {
  const usable = (value) => typeof value === 'string' && POSTGRES_URL.test(value);

  // 1. Exact, unprefixed names, in priority order.
  for (const name of CONNECTION_VARS) {
    if (usable(env[name])) return { name, value: env[name] };
  }

  // 2. The same names carrying a store prefix.
  for (const suffix of CONNECTION_VARS) {
    for (const [name, value] of Object.entries(env)) {
      if (name.endsWith(`_${suffix}`) && usable(value)) return { name, value };
    }
  }

  // 3. Any database-ish variable holding a Postgres URL, so an unfamiliar
  //    provider still works rather than failing silently.
  for (const [name, value] of Object.entries(env)) {
    if (DB_NAME_HINT.test(name) && usable(value)) return { name, value };
  }

  return { name: null, value: undefined };
}

const connection = resolveConnectionString();

if (connection.name && connection.name !== 'DATABASE_URL') {
  console.log(`[config] Using database connection string from ${connection.name}`);
}

// On Vercel/Lambda each concurrent instance gets its own module scope, and so
// its own pool. A pool of 10 across 20 warm instances is 200 connections,
// which exhausts a typical Postgres limit. Long-lived servers (Railway, local)
// keep a normal pool.
const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

const pool = new Pool({
  connectionString: connection.value,
  ssl: connection.value && connection.value.includes('localhost') ? false : { rejectUnauthorized: false },
  max: isServerless ? 1 : 10,
  // Release idle connections quickly on serverless so a frozen instance does
  // not hold one open.
  idleTimeoutMillis: isServerless ? 1000 : 30000,
  // Managed Postgres on a free tier suspends when idle and can take well over
  // ten seconds to wake. This is a property of the database, not of the
  // hosting platform — a long-lived server (Railway, local) hits the exact
  // same cold start the first time it queries after the database has gone
  // idle, so this cannot be conditional on isServerless the way pool size is.
  connectionTimeoutMillis: 20000
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

  const attempt = process.env.SKIP_DB_INIT === '1'
    ? Promise.resolve()
    : applySchema();

  // Only a success is memoised. Managed databases can be slow to wake from
  // idle, and caching the rejection would leave this instance returning 503
  // for its whole lifetime over one cold-start timeout.
  initPromise = attempt.catch((err) => {
    initPromise = null;
    throw err;
  });

  return initPromise;
}

// `connection` is the resolution the pool was actually built from, captured at
// import; resolveConnectionString re-reads the environment on demand.
module.exports = { pool, initDb, applySchema, SCHEMA, connection, resolveConnectionString, CONNECTION_VARS };
