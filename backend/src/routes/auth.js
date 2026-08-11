const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' });

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    businessName: user.businessName,
    plan: user.plan,
    trialEndsAt: user.trialEndsAt,
    tone: user.tone
  };
}

router.post('/register', authLimiter, async (req, res) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const businessName = typeof req.body.businessName === 'string' ? req.body.businessName.trim() : '';
    if (!name || !email || !password || !businessName) return res.status(400).json({ error: 'All fields required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });
    if (password.length < 8 || password.length > 128) return res.status(400).json({ error: 'Password must be 8-128 characters' });
    if (name.length > 100 || businessName.length > 200) return res.status(400).json({ error: 'Name or business name is too long' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already in use' });

    const user = await User.create({ name, email, password, businessName, plan: 'free' });
    const fullUser = await User.findById(user.id);
    const token = signToken(user.id);
    res.status(201).json({ token, user: publicUser(fullUser) });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Unable to create account' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user || !(await User.comparePassword(password, user.password))) return res.status(401).json({ error: 'Invalid email or password' });

    const token = signToken(user.id);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Unable to sign in' });
  }
});

router.get('/me', authMiddleware, async (req, res) => res.json({ user: publicUser(req.user), auth: req.auth }));
router.get('/trial', authMiddleware, async (req, res) => res.json({ trialEndsAt: req.user.trialEndsAt, ...req.auth }));

router.patch('/tone', authMiddleware, async (req, res) => {
  try {
    const allowedTones = ['professional', 'friendly', 'casual'];
    if (!allowedTones.includes(req.body.tone)) return res.status(400).json({ error: 'Invalid tone' });
    await User.findByIdAndUpdate(req.user.id, { tone: req.body.tone });
    res.json({ success: true, tone: req.body.tone });
  } catch (err) {
    console.error('Tone update error:', err);
    res.status(500).json({ error: 'Unable to update tone' });
  }
});

module.exports = router;
