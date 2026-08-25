// Gates paid product surface. Must run AFTER the auth middleware, which
// resolves req.user.isActive from trial expiry + Stripe subscription state.
module.exports = (req, res, next) => {
  if (req.user?.isActive) return next();

  res.status(402).json({
    error: 'Your free trial has ended. Subscribe to continue using LocalProof.',
    code: 'SUBSCRIPTION_REQUIRED',
    trialExpired: !!req.user?.trialExpired,
    trialEndsAt: req.user?.trialEndsAt || null
  });
};
