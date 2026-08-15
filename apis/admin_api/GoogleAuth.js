const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const connection = require('../config');
const { establishAdminSession } = require('./adminSession');
const { organizationDomain } = require('./emailPolicy');
const { verifiedOrganizationIdentity } = require('./googleProfilePolicy');

const stripTrailingSlash = (value) => String(value || '').trim().replace(/\/$/, '');
const isProduction = process.env.NODE_ENV === 'production';
const defaultApiUrl = isProduction ? 'https://api.jntugv.edu.in' : 'http://localhost:8888';
const defaultAdminAppUrl = isProduction ? 'https://admin.jntugv.edu.in' : 'http://localhost:3001';
const apiBaseUrl = stripTrailingSlash(process.env.domainIp || process.env.API_BASE_URL || defaultApiUrl);
const callbackURL = stripTrailingSlash(
  process.env.GOOGLE_CALLBACK_URL || `${apiBaseUrl}/api/admins/auth/google/callback`,
);
const adminAppUrl = stripTrailingSlash(process.env.ADMIN_APP_URL || defaultAdminAppUrl);
const configured = Boolean(
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  callbackURL.startsWith('http')
);

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
    const acceptsHtml = req.accepts(['html', 'json']) === 'html';
    if (acceptsHtml) return redirectFailure(res, 'not_configured');
    return res.status(503).json({ message: 'Google login is not configured' });
  }

  const authOptions = {
    scope: ['profile', 'email'],
    session: false,
  };

  if (organizationDomain) {
    authOptions.hd = organizationDomain;
  }

  return passport.authenticate('google', authOptions)(req, res, next);
};

exports.callback = (req, res, next) => {
  if (!configured) return redirectFailure(res, 'not_configured');

  return passport.authenticate('google', { session: false }, async (error, profile) => {
    if (error || !profile) {
      return redirectFailure(res, 'authentication_failed');
    }

    const identity = verifiedOrganizationIdentity(profile);
    if (!identity || !identity.email || !identity.subject) {
      return redirectFailure(res, 'organizational_email_required');
    }

    const { email, subject } = identity;

    try {
      const [rows] = await connection.promise().query(
        `SELECT a.id, a.name, a.username, a.role, a.google_sub
         FROM admins a
         INNER JOIN admin_email_allowlist w ON w.email = LOWER(TRIM(a.username)) AND w.enabled = TRUE
         WHERE LOWER(TRIM(a.username)) = ?
         LIMIT 1`,
        [email],
      );

      if (!rows.length) {
        return redirectFailure(res, 'not_allowlisted');
      }

      const admin = rows[0];
      if (admin.google_sub && admin.google_sub !== subject) {
        return redirectFailure(res, 'account_identity_changed');
      }

      if (!admin.google_sub) {
        await connection.promise().execute(
          'UPDATE admins SET google_sub = ? WHERE id = ? AND google_sub IS NULL',
          [subject, admin.id],
        );
      }

      await establishAdminSession(req, admin);
      return res.redirect(`${adminAppUrl}/dashboard`);
    } catch (sessionError) {
      console.error('Google login failed:', sessionError.message || sessionError);
      return redirectFailure(res, 'server_error');
    }
  })(req, res, next);
};
