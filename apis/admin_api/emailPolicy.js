const organizationDomain = 'jntugv.edu.in';

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const isOrganizationEmail = (value) => {
  const email = normalizeEmail(value);
  const separator = email.lastIndexOf('@');
  return separator > 0 && email.slice(separator + 1) === organizationDomain;
};

const toOrganizationEmail = (value) => {
  const normalized = normalizeEmail(value);
  return normalized.includes('@') ? normalized : `${normalized}@${organizationDomain}`;
};

module.exports = {
  organizationDomain,
  normalizeEmail,
  isOrganizationEmail,
  toOrganizationEmail,
};
