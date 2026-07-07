const jwt = require('jsonwebtoken');
const { RoleType, ROLE_PERMISSIONS, PermissionType } = require('../config/rolePermissions');

const getTokenFromHeader = (req) => {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }

  const [scheme, token] = authHeader.split(' ');
  if (!token || scheme?.toLowerCase() !== 'bearer') {
    return null;
  }

  return token;
};

const buildUserFromToken = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const role = payload.role || RoleType.CUSTOMER;
  const permissions = ROLE_PERMISSIONS[role] || [];

  return {
    id: payload.id || payload.sub || null,
    role,
    active: payload.active !== false,
    permissions,
  };
};

const protect = (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: token missing' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'Server misconfiguration: JWT_SECRET is missing' });
    }

    const decoded = jwt.verify(token, secret);
    const user = buildUserFromToken(decoded);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: invalid token payload' });
    }

    if (user.active === false) {
      return res.status(403).json({ message: 'Forbidden: account is inactive' });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Unauthorized: token expired' });
    }

    return res.status(401).json({ message: 'Unauthorized: invalid token' });
  }
};

const requirePermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (user.role === RoleType.SUPER_ADMIN) {
        return next();
      }

      const normalizedRequired = requiredPermissions.flat().filter(Boolean);
      if (normalizedRequired.length === 0) {
        return next();
      }

      const userPermissions = Array.isArray(user.permissions) ? user.permissions : [];
      const hasAccess = normalizedRequired.every((permission) => userPermissions.includes(permission));

      if (!hasAccess) {
        return res.status(403).json({ message: 'Forbidden: missing required permissions' });
      }

      return next();
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

module.exports = {
  protect,
  requirePermissions,
};
