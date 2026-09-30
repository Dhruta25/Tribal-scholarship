export const rateLimit = ({ limit = 30, windowMs = 15 * 60 * 1000 } = {}) => {
  const buckets = new Map();
  return (req, res, next) => {
    const now = Date.now();
    for (const [key, value] of buckets) if (value.until <= now) buckets.delete(key);
    const key = req.ip;
    const bucket = buckets.get(key) || { count: 0, until: now + windowMs };
    bucket.count++;
    buckets.set(key, bucket);
    if (bucket.count > limit) {
      res.set('Retry-After', String(Math.ceil((bucket.until - now) / 1000)));
      return res.status(429).json({ success: false, message: 'Too many attempts. Please wait and try again.' });
    }
    next();
  };
};
