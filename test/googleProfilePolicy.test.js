const test = require('node:test');
const assert = require('node:assert/strict');
const { verifiedOrganizationIdentity } = require('../apis/admin_api/googleProfilePolicy');

test('accepts a verified Google organizational identity', () => {
  assert.deepEqual(verifiedOrganizationIdentity({
    id: 'google-subject',
    emails: [{ value: 'Admin@JNTUGV.EDU.IN' }],
    _json: { verified_email: true },
  }), { email: 'admin@jntugv.edu.in', subject: 'google-subject' });
});

test('rejects unverified and external Google identities', () => {
  assert.equal(verifiedOrganizationIdentity({
    id: 'one', emails: [{ value: 'admin@jntugv.edu.in' }], _json: { verified_email: false },
  }), null);
  assert.equal(verifiedOrganizationIdentity({
    id: 'two', emails: [{ value: 'admin@gmail.com' }], _json: { verified_email: true },
  }), null);
});
