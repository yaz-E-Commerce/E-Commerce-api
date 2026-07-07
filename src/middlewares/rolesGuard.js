const normalizeRoles = (allowedRoles) => {
  if (!allowedRoles) return [];

  if (Array.isArray(allowedRoles)) {
    return allowedRoles.flatMap((role) => (Array.isArray(role) ? role : [role])).filter(Boolean);
  }

  return [allowedRoles];
};

const requireRoles = (...allowedRoles) => {
  const normalizedRoles = allowedRoles.flatMap(normalizeRoles).filter(Boolean);

  return (req, res, next) => {
    if (process.env.DISABLE_AUTH === 'true') {
      return next();
    }

    if (normalizedRoles.length === 0) {
      return next();
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userRoles = Array.isArray(user.roles)
      ? user.roles
      : user.role
        ? [user.role]
        : [];

    const hasAccess = normalizedRoles.some((role) => userRoles.includes(role));
    if (!hasAccess) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
};

module.exports = { requireRoles };
