const test = require('node:test');
const assert = require('node:assert/strict');
const { requireRoles } = require('../src/middlewares/rolesGuard');

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

test('allows the request when auth is disabled', () => {
  process.env.DISABLE_AUTH = 'true';
  const req = {};
  const res = createRes();
  let nextCalled = false;

  requireRoles(['admin'])(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});

test('rejects the request when no user exists', () => {
  delete process.env.DISABLE_AUTH;
  const req = {};
  const res = createRes();
  let nextCalled = false;

  requireRoles(['admin'])(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.payload, { message: 'Unauthorized' });
});

test('allows the request when the user has one of the required roles', () => {
  const req = { user: { roles: ['customer', 'admin'] } };
  const res = createRes();
  let nextCalled = false;

  requireRoles(['admin', 'manager'])(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});

test('rejects the request when the user lacks the required roles', () => {
  const req = { user: { role: 'customer' } };
  const res = createRes();
  let nextCalled = false;

  requireRoles(['admin'])(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.payload, { message: 'Forbidden' });
});
