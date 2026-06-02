const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });

    // Check if trial has expired
    const now = new Date();
    const trialEnd = new Date(user.trialEndsAt);
    const trialExpired = trialEnd < now;
    const hasPaid = !!(user.plan === 'pro' && user.stripeSubscriptionId);
    user.isActive = !trialExpired || hasPaid;
    user.trialExpired = trialExpired;
    user.daysLeft = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
