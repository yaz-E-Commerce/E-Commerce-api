const RoleType = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MERCHANT: 'merchant',
  CUSTOMER: 'customer',
});

const PermissionType = Object.freeze({
  MANAGE_USERS: 'MANAGE_USERS',
  MANAGE_PRODUCTS: 'MANAGE_PRODUCTS',
  MANAGE_ORDERS: 'MANAGE_ORDERS',
  MANAGE_CATEGORIES: 'MANAGE_CATEGORIES',
});

const ROLE_PERMISSIONS = Object.freeze({
  [RoleType.SUPER_ADMIN]: [],
  [RoleType.ADMIN]: [
    PermissionType.MANAGE_USERS,
    PermissionType.MANAGE_PRODUCTS,
    PermissionType.MANAGE_ORDERS,
    PermissionType.MANAGE_CATEGORIES,
  ],
  [RoleType.MERCHANT]: [
    PermissionType.MANAGE_PRODUCTS,
    PermissionType.MANAGE_ORDERS,
  ],
  [RoleType.CUSTOMER]: [],
});

module.exports = {
  RoleType,
  PermissionType,
  ROLE_PERMISSIONS,
};
