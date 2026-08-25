#!/usr/bin/env node
// Applies the database schema once, so the API does not have to do it on every
// cold start. Run this after provisioning a database, then set SKIP_DB_INIT=1
// in the deployment environment.
//
//   DATABASE_URL=postgres://... npm run migrate

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { applySchema, pool } = require('../src/db');

(async () => {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set — nothing to migrate against.');
    process.exit(1);
  }

  try {
    await applySchema();
    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
