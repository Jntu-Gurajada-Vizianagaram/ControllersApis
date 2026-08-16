const connection = require('../config');
const bcrypt = require('bcrypt');
const { normalizeEmail, isOrganizationEmail } = require('./emailPolicy');

const saltRounds = 10;
const allowedRoles = new Set(['RootAdmin', 'Admin', 'Developer', 'WebAdmin', 'Updates', 'AffiliatedColleges', 'AffliatedColleges', 'Directors']);

exports.add = async (req, res) => {
  const data = req.body.data || req.body;
  const email = normalizeEmail(data?.username);
  if (!data?.name || !isOrganizationEmail(email) || typeof data.password !== 'string'
    || data.password.length < 10 || !allowedRoles.has(data.role)) {
    return res.status(400).json({
      Success: false,
      MSG: 'Name, jntugv.edu.in email, valid role, and a password of at least 10 characters are required',
    });
  }

  const db = await connection.promise().getConnection();
  try {
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    await db.beginTransaction();
    const [result] = await db.execute(
      'INSERT INTO admins(name, username, password, role) VALUES (?, ?, ?, ?)',
      [data.name, email, hashedPassword, data.role],
    );
    await db.execute(
      `INSERT INTO admin_email_allowlist (email, enabled, created_by) VALUES (?, TRUE, ?)
       ON DUPLICATE KEY UPDATE enabled = TRUE, created_by = VALUES(created_by)`,
      [email, req.session.user.id],
    );
    await db.commit();
    res.status(201).json({ Success: true, id: result.insertId, email });
  } catch (error) {
    try { await db.rollback(); } catch {}
    console.error('Unable to add administrator:', error.message);
    const duplicate = error.code === 'ER_DUP_ENTRY';
    res.status(duplicate ? 409 : 500).json({
      Success: false,
      MSG: duplicate ? 'Administrator already exists' : 'Unable to add administrator',
    });
  } finally {
    db.release();
  }
};

exports.all = (req, res) => {
  connection.query(
    'SELECT id, name, username, role FROM admins ORDER BY id',
    (error, rows) => error
      ? res.status(500).json({ message: 'Unable to retrieve administrators' })
      : res.json(rows),
  );
};

exports.remove = (req, res) => {
  if (Number(req.params.id) === Number(req.session.user.id)) {
    return res.status(400).json({ message: 'You cannot remove your own active administrator account' });
  }
  connection.query('SELECT id, username FROM admins WHERE id = ?', [req.params.id], (selectError, rows) => {
    if (selectError) return res.status(500).json({ message: 'Unable to remove administrator' });
    if (!rows.length) return res.status(404).json({ message: 'Administrator not found' });
    const email = normalizeEmail(rows[0].username);
    connection.query('DELETE FROM admins WHERE id = ?', [req.params.id], (deleteError) => {
      if (deleteError) return res.status(500).json({ message: 'Unable to remove administrator' });
      connection.query('UPDATE admin_email_allowlist SET enabled = FALSE WHERE email = ?', [email]);
      res.json({ Success: true, msg: `${email} administrator removed` });
    });
  });
};
