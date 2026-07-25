exports.requireAuth = (req, res, next) => {
  if (!req.user) {
    console.warn(`[AUTH 401] anonymous request ${req.method} ${req.originalUrl}`);
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

exports.requireRole = (...allowedRoles) => (req, res, next) => {
  const role = req.user?.role;
  if (!role || !allowedRoles.includes(role)) {
    console.warn(
      `[AUTH 403] ${req.user?.email || "unknown"} role=${role} cannot access ${req.method} ${req.originalUrl}`
    );
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};