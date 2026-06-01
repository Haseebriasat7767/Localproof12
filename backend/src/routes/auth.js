const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, businessName } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already in use' });

    const user = await User.create({ name, email, password, businessName });
    const token = signToken(user.id);

    res.status(201).json({ token, user: { id: user.id, name, email, businessName: user.businessName, plan: user.plan } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await User.comparePassword(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = signToken(user.id);
    res.json({ token, user: { id: user.id, name: user.name, email, businessName: user.businessName, plan: user.plan } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  res.json({ user: req.user });
});

// Update tone preference
router.patch('/tone', authMiddleware, async (req, res) => {
  try {
    const { tone } = req.body;
    await User.findByIdAndUpdate(req.user.id, { tone });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
