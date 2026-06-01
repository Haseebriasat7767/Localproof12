const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Feedback = require('../models/Feedback');

const router = express.Router();

// Update business profile
router.patch('/profile', auth, async (req, res) => {
  try {
    const { businessName, tone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { businessName, tone }
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get unhappy customer alerts
router.get('/alerts', auth, async (req, res) => {
  try {
    const alerts = await Feedback.find(
      { userId: req.user.id, isUnhappy: true },
      { limit: 50 }
    );
    res.json({ alerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all feedback
router.get('/feedback', auth, async (req, res) => {
  try {
    const feedback = await Feedback.find(
      { userId: req.user.id },
      { limit: 100 }
    );
    res.json({ feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
