const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const connection = require('../config');
const { establishAdminSession } = require('./adminSession');
const { organizationDomain } = require('./emailPolicy');
const { verifiedOrganizationIdentity } = require('./googleProfilePolicy');

const callbackURL = process.env.GOOGLE_CALLBACK_URL
  || `${String(process.env.domainIp || '').replace(/\/$/, '')}/api/admins/auth/google/callback`;
const adminAppUrl = String(process.env.ADMIN_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
const configured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && callbackURL.startsWith('http'));

if (configured) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL,
    state: true,
  }, (accessToken, refreshToken, profile, done) => done(null, profile)));
}

const redirectFailure = (res, code) => {
  res.redirect(`${adminAppUrl}/login?google_error=${encodeURIComponent(code)}`);
};

exports.start = (req, res, next) => {
  if (!configured) {
    return res.status(503).json({ message: 'Google login is not configured' });
  }
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    hd: organizationDomain,
    session: false,
  })(req, res, next);
};

exports.callback = (req, res, next) => {
  if (!configured) return redirectFailure(res, 'not_configured');

  passport.authenticate('google', { session: false }, async (error, profile) => {
    if (error || !profile) return redirectFailure(res, 'authentication_failed');

    const identity = verifiedOrganizationIdentity(profile);
    if (!identity) {
      return redirectFailure(res, 'organizational_email_required');
    }
    const { email, subject } = identity;

    connection.query(
      `SELECT a.id, a.name, a.username, a.role, a.google_sub
       FROM admins a
       INNER JOIN admin_email_allowlist w ON w.email = LOWER(TRIM(a.username)) AND w.enabled = TRUE
       WHERE LOWER(TRIM(a.username)) = ?
       LIMIT 1`,
      [email],
      async (queryError, rows) => {
        if (queryError) {
          console.error('Google login account lookup failed:', queryError.message);
          return redirectFailure(res, 'server_error');
        }
        if (!rows.length) return redirectFailure(res, 'not_allowlisted');

        const admin = rows[0];
        if (admin.google_sub && admin.google_sub !== subject) {
          return redirectFailure(res, 'account_identity_changed');
        }

        try {
          if (!admin.google_sub) {
            await connection.promise().execute(
              'UPDATE admins SET google_sub = ? WHERE id = ? AND google_sub IS NULL',
              [subject, admin.id],
            );
          }
          await establishAdminSession(req, admin);
          res.redirect(`${adminAppUrl}/dashboard`);
        } catch (sessionError) {
          console.error('Google login session creation failed:', sessionError.message);
          redirectFailure(res, 'server_error');
        }
      },
    );
  })(req, res, next);
};
