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
    res.json({ token, user: { id: user.id, name: user.name, email, businessName: user.businessName, plan: user.plan, trialEndsAt: user.trialEndsAt } });
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

module.exports = router;
