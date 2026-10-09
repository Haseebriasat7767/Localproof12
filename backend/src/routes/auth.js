const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Credential endpoints are brute-force targets; successful logins don't count
// against the limit so a legitimate user is never locked out by their own use.
const skipInTest = () => process.env.NODE_ENV === 'test';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: { error: 'Too many login attempts. Please try again in a few minutes.' }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: { error: 'Too many accounts created from this address. Please try again later.' }
});

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Register - new users start a 14-day trial; 'pro' is only ever set by Stripe.
router.post('/register', registerLimiter, async (req, res, next) => {
  try {
    const { name, email, password, businessName } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields required' });
    if (password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already in use' });

    const user = await User.create({ name, email, password, businessName, plan: 'trialing' });
    const token = signToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        businessName: user.businessName,
        plan: user.plan,
        stripeSubscriptionId: user.stripeSubscriptionId,
        trialEndsAt: user.trialEndsAt
      }
    });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await User.comparePassword(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = signToken(user.id);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email,
        businessName: user.businessName,
        googleReviewUrl: user.googleReviewUrl,
        plan: user.plan,
        stripeSubscriptionId: user.stripeSubscriptionId,
        trialEndsAt: user.trialEndsAt
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res, next) => {
  res.json({ user: req.user });
});

// Get trial status
router.get('/trial', authMiddleware, async (req, res, next) => {
  const now = new Date();
  const trialEnd = new Date(req.user.trialEndsAt);
  const trialExpired = trialEnd < now;
  const hasPaid = !!(req.user.plan === 'pro' && req.user.stripeSubscriptionId);
  const daysLeft = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));
  res.json({
    trialEndsAt: req.user.trialEndsAt,
    trialExpired,
    hasPaid,
    daysLeft,
    isActive: !trialExpired || hasPaid
  });
});

// Update tone preference
router.patch('/tone', authMiddleware, async (req, res, next) => {
  try {
    const { tone } = req.body;
    await User.findByIdAndUpdate(req.user.id, { tone });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// --- Demo account -----------------------------------------------------------
// A seeded demo account (see scripts/seed-demo.js) lets a prospective buyer
// click through the whole product without signing up. The login page shows a
// "try the demo" button only when the account exists on this deployment.
const DEMO_EMAIL = () => (process.env.DEMO_EMAIL || 'demo@localproof.app').toLowerCase();

const demoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: { error: 'Too many demo logins. Please try again later.' }
});

// Public: does this deployment have a demo account? Drives the login page UI.
router.get('/demo', async (req, res, next) => {
  try {
    const demo = await User.findOne({ email: DEMO_EMAIL() });
    res.json({ available: !!demo, email: demo ? demo.email : null });
  } catch (err) {
    next(err);
  }
});

// Public: logs in as the demo account. The account is meant to be shared, so
// there is no password to guess — the endpoint just issues a session.
router.post('/demo-login', demoLimiter, async (req, res, next) => {
  try {
    const demo = await User.findOne({ email: DEMO_EMAIL() });
    if (!demo) return res.status(404).json({ error: 'No demo account on this deployment' });

    const token = signToken(demo.id);
    res.json({
      token,
      user: {
        id: demo.id,
        name: demo.name,
        email: demo.email,
        businessName: demo.businessName,
        googleReviewUrl: demo.googleReviewUrl,
        plan: demo.plan,
        stripeSubscriptionId: demo.stripeSubscriptionId,
        trialEndsAt: demo.trialEndsAt,
        isDemo: true
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
