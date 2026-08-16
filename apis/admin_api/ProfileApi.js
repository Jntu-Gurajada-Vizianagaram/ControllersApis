const connection = require('../config');
const { normalizeEmail } = require('./emailPolicy');

const editableFields = [
  'name',
  'username',
  'profile_type',
  'designation',
  'department',
  'unit',
  'phone',
  'about',
  'role',
  'public_url',
  'visibility',
  'status',
];

const adminRoles = new Set(['rootadmin', 'admin', 'developer']);

const isPrivileged = (user) => adminRoles.has(String(user?.role || '').toLowerCase());

const profileTypeForRole = (role = '') => {
  const normalized = String(role || '').toLowerCase();
  if (normalized === 'directors') return 'Director';
  if (normalized === 'webadmin') return 'University Professional';
  if (normalized === 'updates') return 'University Professional';
  if (normalized.includes('college')) return 'University Professional';
  return 'Administrator';
};

const sanitize = (body = {}, fallback = {}) => {
  const data = {};
  editableFields.forEach((field) => {
    if (body[field] !== undefined) data[field] = String(body[field] ?? '').trim();
  });
  data.name = data.name || fallback.name || '';
  data.username = normalizeEmail(data.username || fallback.username || fallback.email || '');
  data.role = data.role || fallback.role || 'Admin';
  data.profile_type = data.profile_type || fallback.profile_type || profileTypeForRole(data.role);
  data.department = data.department || fallback.department || '';
  data.visibility = ['public', 'private'].includes(data.visibility) ? data.visibility : (fallback.visibility || 'private');
  data.status = ['active', 'inactive'].includes(data.status) ? data.status : (fallback.status || 'active');
  return data;
};

const saveProfile = async (db, data, adminId = null) => {
  await db.execute(
    `INSERT INTO admins_profile
      (admin_id, name, username, profile_type, designation, department, unit, phone, about, role, public_url, visibility, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      admin_id = COALESCE(VALUES(admin_id), admin_id),
      name = VALUES(name),
      profile_type = VALUES(profile_type),
      designation = VALUES(designation),
      department = VALUES(department),
      unit = VALUES(unit),
      phone = VALUES(phone),
      about = VALUES(about),
      role = VALUES(role),
      public_url = VALUES(public_url),
      visibility = VALUES(visibility),
      status = VALUES(status)`,
    [
      adminId,
      data.name,
      data.username,
      data.profile_type,
      data.designation || null,
      data.department,
      data.unit || null,
      data.phone || null,
      data.about || null,
      data.role,
      data.public_url || null,
      data.visibility,
      data.status,
    ],
  );
};

exports.me = async (req, res) => {
  const user = req.session.user;
  try {
    const db = connection.promise();
    const username = normalizeEmail(user.email || user.username || '');
    const [rows] = await db.execute('SELECT * FROM admins_profile WHERE username = ? LIMIT 1', [username]);
    if (rows.length) return res.json(rows[0]);

    const data = sanitize({}, {
      name: user.name,
      username,
      role: user.role,
      profile_type: profileTypeForRole(user.role),
    });
    await saveProfile(db, data, user.id);
    const [createdRows] = await db.execute('SELECT * FROM admins_profile WHERE username = ? LIMIT 1', [username]);
    res.json(createdRows[0]);
  } catch (error) {
    console.error('Unable to load profile:', error.message);
    res.status(500).json({ error: 'Unable to load profile' });
  }
};

exports.updateMe = async (req, res) => {
  const user = req.session.user;
  try {
    const db = connection.promise();
    const username = normalizeEmail(user.email || user.username || '');
    const data = sanitize(req.body, {
      name: user.name,
      username,
      role: user.role,
      profile_type: profileTypeForRole(user.role),
    });
    data.username = username;
    data.role = user.role;
    await saveProfile(db, data, user.id);
    req.session.user.name = data.name;
    await new Promise((resolve, reject) => req.session.save(error => error ? reject(error) : resolve()));
    const [rows] = await db.execute('SELECT * FROM admins_profile WHERE username = ? LIMIT 1', [username]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Unable to update profile:', error.message);
    res.status(500).json({ error: 'Unable to update profile' });
  }
};

exports.all = async (req, res) => {
  if (!isPrivileged(req.session.user)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const [rows] = await connection.promise().execute('SELECT * FROM admins_profile ORDER BY updated_at DESC, id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Unable to load profiles' });
  }
};

exports.create = async (req, res) => {
  if (!isPrivileged(req.session.user)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const data = sanitize(req.body);
    if (!data.name || !data.username) return res.status(400).json({ error: 'Name and email are required' });
    await saveProfile(connection.promise(), data, req.body.admin_id || null);
    const [rows] = await connection.promise().execute('SELECT * FROM admins_profile WHERE username = ? LIMIT 1', [data.username]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Unable to create profile:', error.message);
    res.status(500).json({ error: 'Unable to create profile' });
  }
};

exports.update = async (req, res) => {
  const profileId = Number(req.params.id);
  const db = connection.promise();
  try {
    const [rows] = await db.execute('SELECT * FROM admins_profile WHERE id = ? LIMIT 1', [profileId]);
    if (!rows.length) return res.status(404).json({ error: 'Profile not found' });
    const existing = rows[0];
    const userEmail = normalizeEmail(req.session.user.email || req.session.user.username || '');
    if (!isPrivileged(req.session.user) && normalizeEmail(existing.username) !== userEmail) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const data = sanitize(req.body, existing);
    if (!isPrivileged(req.session.user)) {
      data.username = existing.username;
      data.role = existing.role;
      data.status = existing.status;
    }
    await saveProfile(db, data, existing.admin_id);
    const [updatedRows] = await db.execute('SELECT * FROM admins_profile WHERE username = ? LIMIT 1', [data.username]);
    res.json(updatedRows[0]);
  } catch (error) {
    console.error('Unable to update profile:', error.message);
    res.status(500).json({ error: 'Unable to update profile' });
  }
};

exports.remove = async (req, res) => {
  if (!isPrivileged(req.session.user)) return res.status(403).json({ error: 'Forbidden' });
  try {
    await connection.promise().execute('DELETE FROM admins_profile WHERE id = ?', [req.params.id]);
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Unable to delete profile' });
  }
};
