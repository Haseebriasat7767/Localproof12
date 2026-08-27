const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { initDb, pool, connection, CONNECTION_VARS } = require('./db');
const { checkEnv } = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

// Report configuration problems once at boot, before anything depends on them.
checkEnv();

const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');
const businessRoutes = require('./routes/business');
const billingRoutes = require('./routes/billing');
const widgetRoutes = require('./routes/widget');

const app = express();
const dbReady = initDb();

// Each request awaits dbReady and turns a failure into a 503, but nothing is
// attached at boot — so a failing connection surfaced as an unhandled rejection
// that killed the process before it could answer, /health included. Claim it
// here; the per-request handler still reports the real error.
dbReady.catch(() => {});

// Runs behind Vercel/Railway's proxy. Without this, express sees the proxy's
// IP for every request and the rate limiters would share one bucket across
// all visitors.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));

// Reports whether the database is actually reachable, and which environment
// variable the connection string came from. Names only — never values — so this
// is safe to expose and turns "Database unavailable" into something diagnosable
// without digging through platform logs.
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    database: {
      configuredFrom: connection.name || null,
      state: 'unknown'
    }
  };

  if (!connection.name) {
    health.status = 'degraded';
    health.database.state = 'not configured';
    health.database.searchedFor = CONNECTION_VARS;
    health.database.candidateVarsPresent = Object.keys(process.env)
      .filter((name) => /(DATABASE|POSTGRES|NILEDB)/i.test(name))
      .sort();
    return res.status(503).json(health);
  }

  try {
    await pool.query('SELECT 1');
    health.database.state = 'connected';
    return res.json(health);
  } catch (err) {
    health.status = 'degraded';
    health.database.state = 'unreachable';
    health.database.reason = err.code || err.message;
    return res.status(503).json(health);
  }
});

app.use(async (req, res, next) => {
  try {
    await dbReady;
    next();
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    res.status(503).json({ error: 'Database unavailable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/widget', widgetRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Must be last: express only treats a 4-arg middleware as an error handler.
app.use(errorHandler);

module.exports = app;
