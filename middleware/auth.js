const normalizeRole = (role) => String(role || '').trim().toLowerCase();

const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

const requireRoles = (...roles) => {
  const allowedRoles = new Set(roles.map(normalizeRole));

  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userRole = normalizeRole(req.session.user.role);
    if (userRole !== 'rootadmin' && !allowedRoles.has(userRole)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }

    next();
  };
};

module.exports = { requireAuth, requireRoles };
