const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeEmail,
  isOrganizationEmail,
  toOrganizationEmail,
} = require('../apis/admin_api/emailPolicy');

test('normalizes organizational emails', () => {
  assert.equal(normalizeEmail(' Admin@JNTUGV.EDU.IN '), 'admin@jntugv.edu.in');
});

test('accepts only the exact organizational domain', () => {
  assert.equal(isOrganizationEmail('admin@jntugv.edu.in'), true);
  assert.equal(isOrganizationEmail('admin@sub.jntugv.edu.in'), false);
  assert.equal(isOrganizationEmail('admin@gmail.com'), false);
});

test('turns an allowlist username into an organizational email', () => {
  assert.equal(toOrganizationEmail('webadmin'), 'webadmin@jntugv.edu.in');
});
