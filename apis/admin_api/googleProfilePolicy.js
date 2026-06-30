const { normalizeEmail, isOrganizationEmail } = require('./emailPolicy');

const verifiedOrganizationIdentity = (profile) => {
  const email = normalizeEmail(profile?.emails?.[0]?.value);
  const verified = profile?._json?.verified_email === true
    || profile?._json?.email_verified === true;
  if (!profile?.id || !verified || !isOrganizationEmail(email)) return null;
  return { email, subject: profile.id };
};

module.exports = { verifiedOrganizationIdentity };
