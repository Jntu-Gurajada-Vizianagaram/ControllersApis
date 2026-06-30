const connection = require('../config');
const { isOrganizationEmail, toOrganizationEmail } = require('./emailPolicy');

exports.list = (req, res) => {
  connection.query(
    'SELECT email, enabled, created_by, created_at, updated_at FROM admin_email_allowlist ORDER BY email',
    (error, rows) => error
      ? res.status(500).json({ message: 'Unable to retrieve allowlist' })
      : res.json(rows),
  );
};

exports.add = (req, res) => {
  const email = toOrganizationEmail(req.body.email || req.body.username);
  if (!isOrganizationEmail(email)) {
    return res.status(400).json({ message: 'Only jntugv.edu.in organizational emails can be allowed' });
  }
  connection.query(
    `INSERT INTO admin_email_allowlist (email, enabled, created_by) VALUES (?, TRUE, ?)
     ON DUPLICATE KEY UPDATE enabled = TRUE, created_by = VALUES(created_by)`,
    [email, req.session.user.id],
    error => error
      ? res.status(500).json({ message: 'Unable to update allowlist' })
      : res.status(201).json({ email, enabled: true }),
  );
};

exports.remove = (req, res) => {
  const email = toOrganizationEmail(req.params.email);
  if (!isOrganizationEmail(email)) {
    return res.status(400).json({ message: 'Invalid organizational email' });
  }
  if (email === req.session.user.email) {
    return res.status(400).json({ message: 'You cannot disable your own active login email' });
  }
  connection.query(
    'UPDATE admin_email_allowlist SET enabled = FALSE WHERE email = ?',
    [email],
    (error, result) => {
      if (error) return res.status(500).json({ message: 'Unable to update allowlist' });
      if (!result.affectedRows) return res.status(404).json({ message: 'Email is not allowlisted' });
      res.json({ email, enabled: false });
    },
  );
};
