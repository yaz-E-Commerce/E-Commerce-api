const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { protect, requirePermissions } = require('../src/middlewares/authMiddleware');
const { RoleType, PermissionType } = require('../src/config/rolePermissions');

function createRes() {
  return {
    statusCode: null,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };
}

test('protect injects user and permissions from the token payload', () => {
  process.env.JWT_SECRET = 'test-secret';
  const token = jwt.sign({ id: 'user-1', role: RoleType.MERCHANT, active: true }, process.env.JWT_SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createRes();
  let nextCalled = false;

  protect(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.id, 'user-1');
  assert.equal(req.user.role, RoleType.MERCHANT);
  assert.deepEqual(req.user.permissions, [PermissionType.MANAGE_PRODUCTS, PermissionType.MANAGE_ORDERS]);
});

test('requirePermissions bypasses super admins immediately', () => {
  const req = { user: { role: RoleType.SUPER_ADMIN, permissions: [] } };
  const res = createRes();
  let nextCalled = false;

  requirePermissions(PermissionType.MANAGE_USERS)(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});

test('requirePermissions blocks when permissions are missing', () => {
  const req = { user: { role: RoleType.CUSTOMER, permissions: [] } };
  const res = createRes();
  let nextCalled = false;

  requirePermissions(PermissionType.MANAGE_PRODUCTS)(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.payload, { message: 'Forbidden: missing required permissions' });
});
