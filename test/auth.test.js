const test = require('node:test');
const assert = require('node:assert/strict');
const { requireAuth, requireRoles } = require('../middleware/auth');

const response = () => ({
  statusCode: 200,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test('requireAuth rejects a missing session user', () => {
  const res = response();
  requireAuth({ session: {} }, res, () => assert.fail('next should not run'));
  assert.equal(res.statusCode, 401);
});

test('requireRoles accepts roles case-insensitively', () => {
  let called = false;
  requireRoles('Admin')(
    { session: { user: { role: 'admin' } } },
    response(),
    () => { called = true; },
  );
  assert.equal(called, true);
});

test('requireRoles grants RootAdmin access to every authenticated role guard', () => {
  const middleware = requireRoles('WebAdmin');
  let nextCalled = false;

  middleware(
    { session: { user: { role: 'RootAdmin' } } },
    {},
    () => { nextCalled = true; },
  );

  assert.equal(nextCalled, true);
});

test('requireRoles rejects an unauthorized user', () => {
  const res = response();
  requireRoles('Admin')(
    { session: { user: { role: 'Updates' } } },
    res,
    () => assert.fail('next should not run'),
  );
  assert.equal(res.statusCode, 403);
});
