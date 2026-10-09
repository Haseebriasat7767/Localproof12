// In-memory Postgres for the test-suite.
//
// The API tests exercise the real HTTP surface against a real database. This
// hook swaps the `pg` module for pg-mem's in-memory adapter, so the whole
// suite runs with `npm run test:memory` — no Postgres to provision, nothing
// to clean up. CI still runs the same tests against real Postgres (see
// .github/workflows/test.yml); this is the zero-setup local path.
//
// Loaded via `node --require ./test/helpers/pgMem.js --test test/*.test.js`,
// before any test file (and therefore before src/) is required.

const { newDb } = require('pg-mem');

const db = newDb();
const pgAdapter = db.adapters.createPg();

// Patch the module cache so every `require('pg')` in src/ resolves to the
// in-memory adapter instead of the real driver.
const pgPath = require.resolve('pg');
require.cache[pgPath] = {
  id: pgPath,
  filename: pgPath,
  loaded: true,
  exports: pgAdapter
};

// The suite skips itself without a connection string; give it one. The value
// is never dialed — the adapter intercepts all queries.
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://mem:mem@localhost:5432/localproof_mem';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

module.exports = { db, pgAdapter };
