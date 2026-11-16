#!/usr/bin/env node
// Runs the FULL backend test suite (including the HTTP/DB tests in api.test.js)
// against a throwaway embedded PostgreSQL — no local Postgres or cloud database
// required. Uses its own port and data directory, so it can run alongside
// `npm run demo` without touching the demo's data.
//
//   npm run test:all

const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');

const PG_PORT = parseInt(process.env.TEST_PG_PORT || '5434', 10);
// Throwaway cluster lives in the OS temp dir (outside the repo) so it can never
// be committed or snapshotted. Override with TEST_PG_DIR if needed.
const DATA_DIR = process.env.TEST_PG_DIR || path.join(os.tmpdir(), 'localproof-test-pg');
const DB_NAME = 'localproof_test';
const BACKEND_DIR = path.join(__dirname, '..');

(async () => {
  const mod = require('embedded-postgres');
  const EmbeddedPostgres = mod.default || mod;

  fs.rmSync(DATA_DIR, { recursive: true, force: true });

  const pg = new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    user: 'postgres',
    password: 'postgres',
    port: PG_PORT,
    persistent: false,
    autoRehydrateSymlinks: true,
    onLog: () => {},
    onError: (m) => console.error('[pg]', (m && (m.message || m)) || 'unknown error')
  });

  console.log('[test] booting embedded PostgreSQL on port ' + PG_PORT + '...');
  await pg.initialise();
  await pg.start();
  await pg.createDatabase(DB_NAME);

  const files = fs.readdirSync(path.join(BACKEND_DIR, 'test'))
    .filter((f) => f.endsWith('.test.js'))
    .map((f) => path.join('test', f));

  console.log(`[test] running ${files.length} test files against embedded Postgres\n`);

  const env = {
    ...process.env,
    DATABASE_URL: `postgres://postgres:postgres@localhost:${PG_PORT}/${DB_NAME}`,
    JWT_SECRET: 'ci_test_secret',
    NODE_ENV: 'test'
  };

  const child = spawn(process.execPath, ['--test', ...files], {
    env,
    cwd: BACKEND_DIR,
    stdio: 'inherit'
  });

  child.on('exit', async (code) => {
    try { await pg.stop(); } catch (_) {}
    process.exit(code || 0);
  });
})().catch(async (err) => {
  console.error('[test] failed to run:', (err && (err.stack || err.message)) || err);
  process.exit(1);
});
