const jwt = require('jsonwebtoken');

const RoleType = require('../common/enum/role-type.enum');
const { ROLE_PERMISSIONS } = require('../common/enum/rolePermissions');

const createAuthError = (message, statusCode = 401) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

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

const normalizeRole = (rawRole) => {
  if (typeof rawRole !== 'string') {
    return null;
  }

  const normalizedRole = rawRole.trim().toLowerCase();
  switch (normalizedRole) {
    case 'super_admin':
      return RoleType.SUPER_ADMIN;
    case 'admin':
      return RoleType.ADMIN;
    case 'merchant':
      return RoleType.MERCHANT;
    case 'customer':
      return RoleType.CUSTOMER;
    default:
      return null;
  }
};

const buildUserFromToken = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const role = normalizeRole(payload.role);
  if (!role) {
    throw createAuthError('auth.errors.INVALID_ROLE', 401);
  }

  const permissions = Array.isArray(ROLE_PERMISSIONS[role]) ? ROLE_PERMISSIONS[role] : [];

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
      return next(createAuthError('auth.errors.TOKEN_MISSING', 401));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(createAuthError('auth.errors.JWT_SECRET_MISSING', 500));
    }

    const decoded = jwt.verify(token, secret);
    const user = buildUserFromToken(decoded);

    if (!user) {
      return next(createAuthError('auth.errors.INVALID_TOKEN_PAYLOAD', 401));
    }

    if (user.active === false) {
      return next(createAuthError('auth.errors.ACCOUNT_INACTIVE', 403));
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(createAuthError('auth.errors.TOKEN_EXPIRED', 401));
    }

    if (error.statusCode) {
      return next(error);
    }

    return next(createAuthError('auth.errors.INVALID_TOKEN', 401));
  }
};

const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return next(createAuthError('auth.errors.UNAUTHORIZED', 401));
      }

      if (user.role === RoleType.SUPER_ADMIN) {
        return next();
      }

      const normalizedUserRole = normalizeRole(user.role);
      if (!normalizedUserRole) {
        return next(createAuthError('auth.errors.INVALID_ROLE', 401));
      }

      const hasRole = allowedRoles.flat().includes(normalizedUserRole);
      if (!hasRole) {
        return next(createAuthError('auth.errors.FORBIDDEN_ROLE', 403));
      }

      return next();
    } catch (error) {
      return next(createAuthError('common.errors.UNEXPECTED', 500));
    }
  };
};

const requirePermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return next(createAuthError('auth.errors.UNAUTHORIZED', 401));
      }

      if (user.role === RoleType.SUPER_ADMIN) {
        return next();
      }

      const normalizedUserRole = normalizeRole(user.role);
      if (!normalizedUserRole) {
        return next(createAuthError('auth.errors.INVALID_ROLE', 401));
      }

      const normalizedRequired = requiredPermissions.flat().filter(Boolean);
      if (normalizedRequired.length === 0) {
        return next();
      }

      const userPermissions = Array.isArray(user.permissions) ? user.permissions : [];
      const hasAccess = normalizedRequired.every((permission) => userPermissions.includes(permission));

      if (!hasAccess) {
        return next(createAuthError('auth.errors.FORBIDDEN_PERMISSIONS', 403));
      }

      return next();
    } catch (error) {
      return next(createAuthError('common.errors.UNEXPECTED', 500));
    }
  };
};

module.exports = {
  protect,
  requireRoles,
  requirePermissions,
};