require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');

const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');
const businessRoutes = require('./routes/business');
const billingRoutes = require('./routes/billing');
const widgetRoutes = require('./routes/widget');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/widget', widgetRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`LocalProof API running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
