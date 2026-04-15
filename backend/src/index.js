require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');
const businessRoutes = require('./routes/business');
const billingRoutes = require('./routes/billing');
const widgetRoutes = require('./routes/widget');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/widget', widgetRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`LocalProof API running on port ${PORT}`));
