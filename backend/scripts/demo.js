#!/usr/bin/env node
// One-command live demo: boots a throwaway embedded PostgreSQL, creates the
// schema, seeds a realistic demo business, and serves the API *and* the built
// React frontend from a single process on one port.
//
//   cd frontend && npm install && npm run build      # once, to build the UI
//   cd backend  && npm install && npm run demo       # then start everything
//
// No external services are required. Stripe / DeepSeek / Resend / Google are
// simply inactive in the demo (the app degrades gracefully and logs that at
// boot). The demo database is ephemeral — it is recreated fresh on each run.

const path = require('path');
const fs = require('fs');
const os = require('os');

const PORT = parseInt(process.env.PORT || '5000', 10);
const PG_PORT = parseInt(process.env.DEMO_PG_PORT || '5433', 10);
// Keep the throwaway cluster in the OS temp dir (outside the repo) so it can
// never be committed or snapshotted. Override with DEMO_PG_DIR if you want it
// to persist somewhere specific.
const DATA_DIR = process.env.DEMO_PG_DIR || path.join(os.tmpdir(), 'localproof-demo-pg');
const DB_NAME = 'localproof_demo';

(async () => {
  const mod = require('embedded-postgres');
  const EmbeddedPostgres = mod.default || mod;

  // Guarantee a clean cluster: initdb refuses a non-empty data directory, and a
  // previous hard kill could have left one behind.
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

  console.log('[demo] starting embedded PostgreSQL on port ' + PG_PORT + '...');
  await pg.initialise();
  await pg.start();
  await pg.createDatabase(DB_NAME);

  // Configure the app environment BEFORE requiring it: src/db.js reads env at
  // import time to build its connection pool.
  process.env.DATABASE_URL = `postgres://postgres:postgres@localhost:${PG_PORT}/${DB_NAME}`;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'localproof_demo_secret';
  process.env.SKIP_DB_INIT = '0';
  process.env.SERVE_FRONTEND = '1';
  process.env.PORT = String(PORT);
  process.env.FRONTEND_URL = process.env.FRONTEND_URL || `http://localhost:${PORT}`;
  process.env.BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

  const { initDb, pool } = require('../src/db');
  await initDb();

  const { seed, DEMO_EMAIL, DEMO_PASSWORD } = require('./seed');
  await seed({ log: (m) => console.log('[seed]', m) });

  const buildDir = path.join(__dirname, '..', '..', 'frontend', 'build');
  const hasBuild = fs.existsSync(buildDir);

  const app = require('../src/app');
  const server = app.listen(PORT, '0.0.0.0', () => {
    const line = '============================================================';
    console.log('\n' + line);
    console.log('  LocalProof — live demo');
    console.log(line);
    console.log(`  App     http://localhost:${PORT}`);
    console.log(`  API     http://localhost:${PORT}/api`);
    console.log(`  Health  http://localhost:${PORT}/health`);
    console.log('  ------------------------------------------------------------');
    console.log(`  Login   ${DEMO_EMAIL}`);
    console.log(`  Pass    ${DEMO_PASSWORD}`);
    if (!hasBuild) {
      console.log('  ------------------------------------------------------------');
      console.log('  NOTE: no frontend/build found — API only. Run:');
      console.log('        cd frontend && npm install && npm run build');
    }
    console.log(line + '\n');
  });

  let shuttingDown = false;
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`\n[demo] ${signal} received — shutting down...`);
    try { server.close(); } catch (_) {}
    try { await pool.end(); } catch (_) {}
    try { await pg.stop(); } catch (_) {}
    process.exit(0);
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
})().catch((err) => {
  console.error('[demo] failed to start:', (err && (err.stack || err.message)) || err);
  process.exit(1);
});
