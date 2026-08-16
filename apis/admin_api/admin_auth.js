const con = require('../config');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const saltRounds = 10;
const { normalizeEmail, isOrganizationEmail } = require('./emailPolicy');
const { establishAdminSession } = require('./adminSession');
const { createTransporter, escapeHtml } = require('../grievance_api/mailer');

const getAdminAppUrl = () =>
  String(process.env.ADMIN_APP_URL || (process.env.NODE_ENV === 'production'
    ? 'https://admin.jntugv.edu.in'
    : 'http://localhost:3001')).replace(/\/+$/, '');

const hashResetToken = (token) =>
  crypto.createHash('sha256').update(String(token || '')).digest('hex');

async function upsertGoogleAdmin({ googleSub, username, name, role = 'Admin' }) {
  if (!googleSub) {
    throw new Error('googleSub is required');
  }

  const db = con.promise();
  const normalizedUsername = normalizeEmail(String(username || '').trim()) || String(username || '').trim();
  const safeName = String(name || '').trim() || 'Admin';
  const safeRole = String(role || 'Admin').trim() || 'Admin';

  await db.execute(
    `INSERT INTO admins (google_sub, username, name, role)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       username = VALUES(username),
       name = VALUES(name),
       role = VALUES(role)`,
    [googleSub, normalizedUsername, safeName, safeRole]
  );

  const [rows] = await db.execute(
    `SELECT id, role, name, username, password, google_sub
     FROM admins
     WHERE google_sub = ?
     LIMIT 1`,
    [googleSub]
  );

  return rows[0];
}

exports.upsertGoogleAdmin = upsertGoogleAdmin;

function extractGoogleIdentity(req) {
  const body = req.body || {};

  const googleSub = [
    body.googleSub,
    body.google_sub,
    body.googleId,
    body.google_id,
    body.sub,
    body.user?.googleSub,
    body.user?.google_sub,
    body.user?.sub,
    body.profile?.sub,
    body.profile?.googleSub,
    body.profile?.google_sub,
    body.profileObj?.googleId,
    body.profileObj?.google_sub,
    body.profileObj?.sub,
  ].find(v => v !== undefined && v !== null && String(v).trim() !== '');

  if (!googleSub) {
    return null;
  }

  return {
    googleSub: String(googleSub).trim(),
    username: String(
      body.email ||
      body.username ||
      body.user?.email ||
      body.user?.username ||
      body.profileObj?.email ||
      ''
    ).trim(),
    name: String(
      body.name ||
      body.user?.name ||
      body.user?.fullName ||
      body.profileObj?.name ||
      body.profileObj?.displayName ||
      ''
    ).trim(),
    role: String(body.role || 'Admin').trim() || 'Admin',
  };
}

function shouldHandleGoogleLogin(req) {
  const candidates = [
    req.originalUrl || '',
    req.url || '',
    req.path || '',
    req.baseUrl || '',
    req.body?.redirect,
    req.body?.page,
    req.body?.returnTo,
    req.query?.redirect,
    req.query?.page,
    req.query?.returnTo,
    req.headers?.referer || '',
  ].filter(Boolean);

  const combined = candidates.join(' ').toLowerCase();

  const allowedPatterns = [
    '/gallery-overview',
    '/galleryoverview',
    '/admin/gallery-overview',
    '/dashboard/gallery',
    '/gallery',
  ];

  return allowedPatterns.some((p) => combined.includes(p));
}

exports.login = async (req, res) => {
  try {
    const googleIdentity = extractGoogleIdentity(req);

    if (googleIdentity?.googleSub && shouldHandleGoogleLogin(req)) {
      const admin = await upsertGoogleAdmin({
        googleSub: googleIdentity.googleSub,
        username: googleIdentity.username,
        name: googleIdentity.name,
        role: googleIdentity.role,
      });

      const user = await establishAdminSession(req, admin);
      return res.json({
        islogin: true,
        role: user.role,
        admin: user.name,
        email: user.email,
        username: user.email,
      });
    }

    const credentials = req.body.credentials || {};
    const identifier = String(credentials.username || '').trim().toLowerCase();
    const password = String(credentials.password || '');

    if (!identifier || !password) {
      return res.status(400).json({ islogin: false, message: 'Login credentials are required' });
    }

    const db = con.promise();
    const isEmailLogin = identifier.includes('@');

    if (isEmailLogin && !isOrganizationEmail(normalizeEmail(identifier))) {
      return res.status(403).json({ islogin: false, message: 'Invalid login credentials' });
    }

    let rows = [];
    let sourceTable = 'admins';

    if (isEmailLogin) {
      [rows] = await db.execute(
        `SELECT a.id, a.role, a.password, a.name, LOWER(TRIM(a.username)) AS username
         FROM admins a
         INNER JOIN admin_email_allowlist w ON w.email = LOWER(TRIM(a.username)) AND w.enabled = TRUE
         WHERE LOWER(TRIM(a.username)) = ?
         LIMIT 1`,
        [normalizeEmail(identifier)],
      );
    } else {
      [rows] = await db.execute(
        `SELECT id, role, password, name, LOWER(TRIM(username)) AS username
         FROM admins
         WHERE LOWER(TRIM(username)) = ?
         LIMIT 1`,
        [identifier],
      );

      if (!rows.length) {
        const [userTables] = await db.execute("SHOW TABLES LIKE 'users'");
        if (userTables.length) {
          sourceTable = 'users';
          const [userColumns] = await db.execute('SHOW COLUMNS FROM users');
          const columnNames = new Set(userColumns.map(column => column.Field));
          const idExpression = columnNames.has('id') ? 'id' : 'username AS id';
          const nameExpression = columnNames.has('name')
            ? "COALESCE(NULLIF(name, ''), username) AS name"
            : 'username AS name';
          const roleExpression = columnNames.has('role')
            ? "COALESCE(NULLIF(role, ''), 'Admin') AS role"
            : "'Admin' AS role";

          [rows] = await db.execute(
            `SELECT ${idExpression},
                    ${roleExpression},
                    password,
                    ${nameExpression},
                    LOWER(TRIM(username)) AS username
             FROM users
             WHERE LOWER(TRIM(username)) = ?
             LIMIT 1`,
            [identifier],
          );
        }
      }
    }

    if (!rows.length) {
      return res.status(401).json({ islogin: false, message: 'Invalid login credentials' });
    }

    const admin = rows[0];
    const storedPassword = String(admin.password || '');
    const passwordMatches = /^\$2[aby]\$/.test(storedPassword)
      ? await bcrypt.compare(password, storedPassword)
      : password === storedPassword;

    if (!passwordMatches) {
      return res.status(401).json({ islogin: false, message: 'Invalid login credentials' });
    }

    if (sourceTable === 'admins' && !/^\$2[aby]\$/.test(storedPassword)) {
      await db.execute('UPDATE admins SET password = ? WHERE id = ?', [
        await bcrypt.hash(storedPassword, saltRounds),
        admin.id,
      ]);
    }

    const user = await establishAdminSession(req, admin);
    return res.json({
      islogin: true,
      role: user.role,
      admin: user.name,
      email: user.email,
      username: user.email,
    });
  } catch (error) {
    console.error('Login failed:', error.message);
    return res.status(500).json({ islogin: false, message: 'Unable to log in' });
  }
};

exports.alladmins = (req, res) => {
  const query = "SELECT id, name, username, role FROM admins ORDER BY id;";
  try {
    con.query(query, (err, result) => {
      if (err) {
        res.json({name:"ADMIN DATA",role:"NOT Fetched"})
        console.log(err + "not fetched");
      } else {
        res.json(result);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

exports.role_session = (req, res) => {
  try {
    res.status(200).json({ user: req.session.user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({ message: 'Unable to log out' });
    }
    res.clearCookie('jntugv.sid');
    res.status(204).send();
  });
};

exports.request_password_reset = async (req, res) => {
  const email = normalizeEmail(req.body?.email || req.body?.username || '');
  const genericResponse = {
    message: 'If an approved admin account exists for this email, a password reset link will be sent.',
  };

  if (!email || !isOrganizationEmail(email)) {
    return res.json(genericResponse);
  }

  try {
    const db = con.promise();
    const [rows] = await db.execute(
      `SELECT a.id, a.name, LOWER(TRIM(a.username)) AS username
       FROM admins a
       INNER JOIN admin_email_allowlist w
         ON w.email = LOWER(TRIM(a.username)) AND w.enabled = TRUE
       WHERE LOWER(TRIM(a.username)) = ?
       LIMIT 1`,
      [email],
    );

    if (!rows.length) return res.json(genericResponse);

    const admin = rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(token);
    const resetLink = `${getAdminAppUrl()}/passwordreset?token=${token}`;

    await db.execute(
      `UPDATE admin_password_reset_tokens
       SET used_at = NOW()
       WHERE admin_id = ? AND used_at IS NULL`,
      [admin.id],
    );
    await db.execute(
      `INSERT INTO admin_password_reset_tokens (admin_id, token_hash, expires_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 MINUTE))`,
      [admin.id, tokenHash],
    );

    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `JNTU-GV Admin Console <${process.env.SMTP_USER}>`,
        to: admin.username,
        subject: 'JNTU-GV Admin Console Password Reset',
        html: `
          <p>Dear ${escapeHtml(admin.name || 'Administrator')},</p>
          <p>Use the secure link below to reset your JNTU-GV Admin Console password. This link expires in 30 minutes.</p>
          <p><a href="${escapeHtml(resetLink)}">Reset Admin Console Password</a></p>
          <p>If you did not request this reset, you can ignore this email.</p>
        `,
      });
      return res.json(genericResponse);
    } catch (mailError) {
      if (process.env.NODE_ENV === 'production') {
        console.error('Password reset email failed:', mailError.message);
        return res.json(genericResponse);
      }
      return res.json({ ...genericResponse, reset_link: resetLink });
    }
  } catch (error) {
    console.error('Password reset request failed:', error.message);
    return res.json(genericResponse);
  }
};

exports.confirm_password_reset = async (req, res) => {
  const token = String(req.body?.token || '').trim();
  const password = String(req.body?.password || '');

  if (!token || password.length < 8) {
    return res.status(400).json({
      message: 'A valid reset token and a password of at least 8 characters are required.',
    });
  }

  let db;
  try {
    db = await con.promise().getConnection();
    const tokenHash = hashResetToken(token);
    const [rows] = await db.execute(
      `SELECT t.id, t.admin_id
       FROM admin_password_reset_tokens t
       WHERE t.token_hash = ?
         AND t.used_at IS NULL
         AND t.expires_at > NOW()
       LIMIT 1`,
      [tokenHash],
    );

    if (!rows.length) {
      return res.status(400).json({ message: 'The reset link is invalid or expired.' });
    }

    await db.beginTransaction();
    await db.execute('UPDATE admins SET password = ? WHERE id = ?', [
      await bcrypt.hash(password, saltRounds),
      rows[0].admin_id,
    ]);
    await db.execute(
      'UPDATE admin_password_reset_tokens SET used_at = NOW() WHERE id = ?',
      [rows[0].id],
    );
    await db.commit();
    return res.json({ message: 'Password updated successfully. Please sign in with your new password.' });
  } catch (error) {
    try { if (db) await db.rollback(); } catch {}
    console.error('Password reset confirmation failed:', error.message);
    return res.status(500).json({ message: 'Unable to reset password.' });
  } finally {
    if (db) db.release();
  }
};

exports.update_admin_user = async (req, res) => {
  const adminId = req.params.id;
  const { name, username, password, role } = req.body;
  const allowedRoles = new Set(['RootAdmin', 'Admin', 'Developer', 'WebAdmin', 'Updates', 'AffiliatedColleges', 'AffliatedColleges', 'Directors']);

  const requestedUsername = normalizeEmail(username);
  if (!name || !requestedUsername || !allowedRoles.has(role)) {
    return res.status(400).json({ Success: false, MSG: 'Valid name, username, and role are required' });
  }

  let db;
  try {
    // If a new password is provided, hash it before updating
    db = await con.promise().getConnection();
    const [existingRows] = await db.execute('SELECT username FROM admins WHERE id = ?', [adminId]);
    if (!existingRows.length) return res.status(404).json({ Success: false, MSG: 'Admin not found' });
    const previousUsername = normalizeEmail(existingRows[0].username);
    const requestedIsOrgEmail = isOrganizationEmail(requestedUsername);
    const previousIsOrgEmail = isOrganizationEmail(previousUsername);

    if (!requestedIsOrgEmail && requestedUsername !== previousUsername) {
      return res.status(400).json({
        Success: false,
        MSG: 'Legacy usernames cannot be changed. Use a valid organizational email for new admin identities.',
      });
    }

    const fields = ['name = ?', 'username = ?', 'role = ?'];
    const values = [name, requestedUsername, role];
    if (previousUsername !== requestedUsername) fields.push('google_sub = NULL');
    if (password) {
      fields.push('password = ?');
      values.push(await bcrypt.hash(password, saltRounds));
    }
    values.push(adminId);
    const sql = `UPDATE admins SET ${fields.join(', ')} WHERE id = ?`;
    await db.beginTransaction();
    await db.execute(sql, values);
    if (requestedIsOrgEmail) {
      await db.execute(
        `INSERT INTO admin_email_allowlist (email, enabled, created_by) VALUES (?, TRUE, ?)
         ON DUPLICATE KEY UPDATE enabled = TRUE, created_by = VALUES(created_by)`,
        [requestedUsername, req.session.user.id],
      );
    }
    if (previousIsOrgEmail && previousUsername !== requestedUsername) {
      await db.execute('UPDATE admin_email_allowlist SET enabled = FALSE WHERE email = ?', [previousUsername]);
    }
    await db.commit();
    if (Number(adminId) === Number(req.session.user.id)) {
      req.session.user.email = requestedUsername;
      req.session.user.name = name;
      req.session.user.role = role;
      await new Promise((resolve, reject) => req.session.save(error => error ? reject(error) : resolve()));
    }
    res.json({ Success: true, MSG: "Admin updated successfully" });
  } catch (error) {
    try { if (db) await db.rollback(); } catch {}
    console.error(error);
    res.status(500).json({ Success: false, MSG: "Error updating admin" });
  } finally {
    if (db) db.release();
  }
};
