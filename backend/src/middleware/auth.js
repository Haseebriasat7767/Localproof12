const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const now = new Date();
    const trialEnd = user.trialEndsAt ? new Date(user.trialEndsAt) : new Date(0);
    const trialExpired = trialEnd < now;
    const hasPaid = user.plan === 'pro' && !!user.stripeSubscriptionId;
    const isActive = !trialExpired || hasPaid;
    const daysLeft = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));

    req.user = user;
    req.auth = { isActive, trialExpired, hasPaid, daysLeft };

    if (!isActive) {
      return res.status(402).json({
        error: 'Trial expired',
        code: 'TRIAL_EXPIRED',
        trialExpired: true,
        daysLeft: 0
      });
    }

    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
