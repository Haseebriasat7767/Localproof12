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

// Start connecting immediately so the first request does not pay the whole
// cold-start cost, but claim the rejection here: unhandled, a failed connection
// killed the process before it could answer anything, /health included.
initDb().catch(() => {});

// Runs behind Vercel/Railway's proxy. Without this, express sees the proxy's
// IP for every request and the rate limiters would share one bucket across
// all visitors.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));

// Liveness probe for the platform's healthcheck: reports only that the process
// is up and serving requests. Deliberately never depends on the database —
// Railway/Vercel treat any non-2xx as "unhealthy" and would kill or endlessly
// restart an instance whose database is just slow to wake, which is exactly
// the case /health below is designed to survive.
app.get('/healthz', (req, res) => res.json({ status: 'ok' }));

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
    // Call per request rather than awaiting one promise captured at boot: a
    // success is memoised, but a failure clears the memo so a database that was
    // asleep on the first request can be reached on the next one.
    await initDb();
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
