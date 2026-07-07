const RoleType = require('../common/enum/role-type.enum');
const PermissionType = require('../common/enum/permission.enum');

const ROLE_PERMISSIONS = Object.freeze({
    [RoleType.SUPER_ADMIN]: [],
    [RoleType.ADMIN]: Object.values(PermissionType),
    [RoleType.MERCHANT]: [PermissionType.MANAGE_PRODUCTS, PermissionType.MANAGE_ORDERS],
    [RoleType.CUSTOMER]: [],
});

module.exports = { RoleType, PermissionType, ROLE_PERMISSIONS };