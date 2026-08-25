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
