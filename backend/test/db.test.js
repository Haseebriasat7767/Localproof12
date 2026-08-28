const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const DB_MODULE = require.resolve('../src/db');

// db.js reads env at import time, so each case needs a fresh module instance.
function loadDb(env = {}) {
  delete require.cache[DB_MODULE];
  const saved = {};
  for (const [k, v] of Object.entries(env)) {
    saved[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    return require('../src/db');
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    delete require.cache[DB_MODULE];
  }
}

const BASE = { DATABASE_URL: 'postgresql://user:pass@db.example.com:5432/app' };

describe('connection string resolution', () => {
  const ALL = ['DATABASE_URL', 'POSTGRES_URL', 'POSTGRES_URL_NON_POOLING', 'NILEDB_POSTGRES_URL', 'NILEDB_URL'];
  const clearAll = Object.fromEntries(ALL.map((k) => [k, undefined]));

  test('prefers DATABASE_URL when several are set', () => {
    const db = loadDb({ ...clearAll, DATABASE_URL: 'postgres://a/db', NILEDB_POSTGRES_URL: 'postgres://b/db' });
    assert.equal(db.connection.name, 'DATABASE_URL');
  });

  test("falls back to Nile's variable when DATABASE_URL is absent", () => {
    // Vercel's Nile integration publishes NILEDB_POSTGRES_URL, never DATABASE_URL.
    const db = loadDb({ ...clearAll, NILEDB_POSTGRES_URL: 'postgres://nile.example/db' });
    assert.equal(db.connection.name, 'NILEDB_POSTGRES_URL');
    assert.equal(db.connection.value, 'postgres://nile.example/db');
  });

  test("falls back to Vercel/Neon's POSTGRES_URL", () => {
    const db = loadDb({ ...clearAll, POSTGRES_URL: 'postgres://neon.example/db' });
    assert.equal(db.connection.name, 'POSTGRES_URL');
  });

  test('actually configures the pool from the fallback variable', () => {
    const db = loadDb({ ...clearAll, NILEDB_POSTGRES_URL: 'postgres://nile.example/db' });
    assert.match(db.pool.options.connectionString, /nile\.example/);
  });

  test('reports nothing found when no provider variable is set', () => {
    const db = loadDb(clearAll);
    assert.equal(db.connection.name, null);
  });

  // resolveConnectionString takes an env object, so these need no module reload.
  const { resolveConnectionString } = require('../src/db');

  test('finds a store-prefixed variable from a marketplace integration', () => {
    // Vercel's Nile integration publishes e.g. iojio_NILEDB_POSTGRES_URL.
    const resolved = resolveConnectionString({
      iojio_NILEDB_POSTGRES_URL: 'postgres://nile.example/db'
    });
    assert.equal(resolved.name, 'iojio_NILEDB_POSTGRES_URL');
    assert.equal(resolved.value, 'postgres://nile.example/db');
  });

  test('ignores an empty prefixed variable and uses the populated one', () => {
    const resolved = resolveConnectionString({
      iojio_POSTGRES_URL: '',
      iojio_NILEDB_POSTGRES_URL: 'postgres://nile.example/db'
    });
    assert.equal(resolved.name, 'iojio_NILEDB_POSTGRES_URL');
  });

  test('never mistakes an https API endpoint for a connection string', () => {
    // NILEDB_API_URL sits alongside the real one and is not Postgres.
    const resolved = resolveConnectionString({
      iojio_NILEDB_API_URL: 'https://api.thenile.dev/databases/abc',
      iojio_NILEDB_POSTGRES_URL: 'postgres://nile.example/db'
    });
    assert.equal(resolved.name, 'iojio_NILEDB_POSTGRES_URL');
  });

  test('finds nothing when only a non-Postgres URL is present', () => {
    const resolved = resolveConnectionString({
      iojio_NILEDB_API_URL: 'https://api.thenile.dev/databases/abc'
    });
    assert.equal(resolved.name, null);
  });

  test('accepts both postgres:// and postgresql:// schemes', () => {
    assert.ok(resolveConnectionString({ DATABASE_URL: 'postgres://a/db' }).name);
    assert.ok(resolveConnectionString({ DATABASE_URL: 'postgresql://a/db' }).name);
  });
});

describe('connection pool', () => {
  test('caps the pool at one connection on serverless', () => {
    const { pool } = loadDb({ ...BASE, VERCEL: '1' });
    assert.equal(pool.options.max, 1);
  });

  test('uses a normal pool on a long-lived server', () => {
    const { pool } = loadDb({ ...BASE, VERCEL: undefined, AWS_LAMBDA_FUNCTION_NAME: undefined });
    assert.equal(pool.options.max, 10);
  });

  test('recognises lambda as serverless too', () => {
    const { pool } = loadDb({ ...BASE, VERCEL: undefined, AWS_LAMBDA_FUNCTION_NAME: 'fn' });
    assert.equal(pool.options.max, 1);
  });

  test('releases idle connections faster on serverless', () => {
    const serverless = loadDb({ ...BASE, VERCEL: '1' }).pool;
    const server = loadDb({ ...BASE, VERCEL: undefined, AWS_LAMBDA_FUNCTION_NAME: undefined }).pool;
    assert.ok(serverless.options.idleTimeoutMillis < server.options.idleTimeoutMillis);
  });

  test('handles pool errors instead of crashing the process', () => {
    const { pool } = loadDb({ ...BASE, VERCEL: '1' });
    // An unhandled 'error' on an EventEmitter throws; a registered listener means
    // a dropped idle client cannot take the process down.
    assert.ok(pool.listenerCount('error') > 0);
  });

  test('disables ssl only for local connections', () => {
    const local = loadDb({ DATABASE_URL: 'postgresql://postgres@localhost:5432/app' }).pool;
    const remote = loadDb(BASE).pool;
    assert.equal(local.options.ssl, false);
    assert.deepEqual(remote.options.ssl, { rejectUnauthorized: false });
  });
});

describe('schema initialisation', () => {
  // initDb reads SKIP_DB_INIT when called, not when imported, so it has to stay
  // set across the call itself rather than only across the require.
  let previousSkip;

  beforeEach(() => {
    previousSkip = process.env.SKIP_DB_INIT;
    process.env.SKIP_DB_INIT = '1';
  });

  afterEach(() => {
    if (previousSkip === undefined) delete process.env.SKIP_DB_INIT;
    else process.env.SKIP_DB_INIT = previousSkip;
  });

  test('runs at most once per process even if called repeatedly', async () => {
    const db = loadDb(BASE);
    const first = db.initDb();
    const second = db.initDb();
    assert.equal(first, second, 'initDb should return the same memoised promise');
    await first;
  });

  test('skips the schema round-trip when SKIP_DB_INIT=1', async () => {
    const db = loadDb(BASE);
    // Would throw ENOTFOUND against the fake host if it actually queried.
    await db.initDb();
  });

  test('does not memoise a failure, so a later request can retry', async () => {
    // A cold-start timeout against a sleeping database must not poison the
    // instance for its whole lifetime.
    delete process.env.SKIP_DB_INIT;
    const db = loadDb({ DATABASE_URL: 'postgresql://user:pass@127.0.0.1:1/none' });

    const first = db.initDb();
    await assert.rejects(first);

    const second = db.initDb();
    assert.notEqual(second, first, 'a failed init must not be cached');
    await assert.rejects(second);

    process.env.SKIP_DB_INIT = '1';
  });

  test('gives every platform the same long timeout to reach a sleeping database', () => {
    // The cold start comes from the database (Nile free tier suspending when
    // idle), not from the hosting platform — a long-lived server hits the
    // same wake-up delay the first time it queries after the database has
    // gone idle, so this must not be conditional on isServerless.
    const serverless = loadDb({ ...BASE, VERCEL: '1' }).pool;
    const server = loadDb({ ...BASE, VERCEL: undefined, AWS_LAMBDA_FUNCTION_NAME: undefined }).pool;
    assert.equal(serverless.options.connectionTimeoutMillis, server.options.connectionTimeoutMillis);
    assert.ok(serverless.options.connectionTimeoutMillis >= 20000, 'must give a suspended database room to wake');
  });

  test('exposes applySchema for the migrate script', () => {
    const db = loadDb(BASE);
    assert.equal(typeof db.applySchema, 'function');
    assert.match(db.SCHEMA, /CREATE TABLE IF NOT EXISTS users/);
    assert.match(db.SCHEMA, /CREATE TABLE IF NOT EXISTS reviews/);
    assert.match(db.SCHEMA, /CREATE TABLE IF NOT EXISTS feedback/);
  });

  test('migrate script exists and is wired to a npm script', () => {
    const pkg = require('../package.json');
    assert.equal(pkg.scripts.migrate, 'node scripts/migrate.js');
    assert.doesNotThrow(() => require.resolve(path.join(__dirname, '../scripts/migrate.js')));
  });
});
