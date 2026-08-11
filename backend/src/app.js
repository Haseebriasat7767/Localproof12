const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');

const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');
const businessRoutes = require('./routes/business');
const billingRoutes = require('./routes/billing');
const widgetRoutes = require('./routes/widget');

const app = express();
const dbReady = initDb();

app.use(cors({ origin: true, credentials: true }));
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));

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

app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
