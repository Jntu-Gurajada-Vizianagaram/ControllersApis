const attempts = new Map();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_SUBMISSIONS = 5;

module.exports = (req, res, next) => {
  const now = Date.now();
  const current = attempts.get(req.ip);
  if (!current || current.resetAt <= now) {
    attempts.set(req.ip, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }
  if (current.count >= MAX_SUBMISSIONS) {
    return res.status(429).json({ message: 'Too many grievance submissions. Try again later.' });
  }
  current.count += 1;
  next();
};
