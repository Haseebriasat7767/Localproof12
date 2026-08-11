const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' });

router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password, businessName } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!name?.trim() || !normalizedEmail || !password) return res.status(400).json({ error: 'All fields required' });
    if (password.length < 8 || password.length > 128) return res.status(400).json({ error: 'Password must be 8-128 characters' });
    if (name.trim().length > 100 || businessName?.trim().length > 200) return res.status(400).json({ error: 'Name or business name is too long' });

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(400).json({ error: 'Email already in use' });

    const user = await User.create({ name: name.trim(), email: normalizedEmail, password, businessName });
    await User.findByIdAndUpdate(user.id, { plan: 'pro' });
    const fullUser = await User.findById(user.id);
    const token = signToken(user.id);
    res.status(201).json({ token, user: { id: user.id, name: fullUser.name, email: fullUser.email, businessName: fullUser.businessName, plan: fullUser.plan, trialEndsAt: fullUser.trialEndsAt } });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Unable to create account' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const { password } = req.body;
    if (!email || typeof password !== 'string') return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const valid = await User.comparePassword(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = signToken(user.id);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, businessName: user.businessName, plan: user.plan, trialEndsAt: user.trialEndsAt } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Unable to sign in' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  res.json({ user: req.user, auth: req.auth });
});

router.get('/trial', authMiddleware, async (req, res) => {
  res.json({ trialEndsAt: req.user.trialEndsAt, trialExpired: req.auth.trialExpired, hasPaid: req.auth.hasPaid, daysLeft: req.auth.daysLeft, isActive: req.auth.isActive });
});

router.patch('/tone', authMiddleware, async (req, res) => {
  try {
    const allowedTones = ['professional', 'friendly', 'casual'];
    const { tone } = req.body;
    if (!allowedTones.includes(tone)) return res.status(400).json({ error: 'Invalid tone' });
    await User.findByIdAndUpdate(req.user.id, { tone });
    res.json({ success: true });
  } catch (err) {
    console.error('Tone update error:', err);
    res.status(500).json({ error: 'Unable to update tone' });
  }
});

module.exports = router;
