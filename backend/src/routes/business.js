const express = require('express');
const auth = require('../middleware/auth');
const requireActive = require('../middleware/requireActive');
const User = require('../models/User');
const Feedback = require('../models/Feedback');

const router = express.Router();

// Paid product surface: authenticate, then require an active trial or subscription.
router.use(auth, requireActive);

// Update business profile
router.patch('/profile', async (req, res, next) => {
  try {
    const { businessName, tone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { businessName, tone }
    );
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// Get unhappy customer alerts
router.get('/alerts', async (req, res, next) => {
  try {
    const alerts = await Feedback.find(
      { userId: req.user.id, isUnhappy: true },
      { limit: 50 }
    );
    res.json({ alerts });
  } catch (err) {
    next(err);
  }
});

// Get all feedback
router.get('/feedback', async (req, res, next) => {
  try {
    const feedback = await Feedback.find(
      { userId: req.user.id },
      { limit: 100 }
    );
    res.json({ feedback });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
