const buckets = new Map();

function rateLimit({ windowMs, max, keyGenerator = (req) => req.ip || 'unknown' }) {
  return (req, res, next) => {
    const now = Date.now();
    const key = `${keyGenerator(req)}:${req.baseUrl}${req.path}`;
    const current = buckets.get(key);

    if (!current || now >= current.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;
    if (current.count > max) {
      const retryAfter = Math.ceil((current.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    next();
  };
}

module.exports = rateLimit;
