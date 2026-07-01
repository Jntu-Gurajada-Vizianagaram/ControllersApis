const con = require("../config");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const express = require('express');
const cors = require("cors");

const session = require('express-session');
const bodyparser = require('body-parser');
const cookieparser = require('cookie-parser');

const app = express();
const { normalizeEmail, isOrganizationEmail } = require('./emailPolicy');
const { establishAdminSession } = require('./adminSession');

app.use(express.json());
app.use(cors());

// app.use(cors({
//   origin :["http://localhost:3000"],
//   methods :["GET","POST"],
//   credentials : true,
// }))

// app.use(cookieparser())
// app.use(bodyparser.urlencoded({extended:true}));

// app.use(session({
//   key : "adminrole",
//   secret : "admins",
//   resave : false,
//   saveUninitialized : false,
//   cookie:{
//     expires: 60*60*24,
//   },
// }));

exports.login = async (req, res) => {
  try {
    const credentials = req.body.credentials || {};
    const identifier = String(credentials.username || '').trim().toLowerCase();
    const password = String(credentials.password || '');
    if (!identifier || !password) {
      return res.status(400).json({ islogin: false, message: 'Login credentials are required' });
    }

    const db = con.promise();
    const isEmailLogin = identifier.includes('@');
    if (isEmailLogin && !isOrganizationEmail(normalizeEmail(identifier))) {
      return res.status(403).json({
        islogin: false,
        message: 'Invalid login credentials',
      });
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
    res.json({
      islogin: true,
      role: user.role,
      admin: user.name,
      email: user.email,
      username: user.email,
    });
  } catch (error) {
    console.error('Password login failed:', error.message);
    res.status(500).json({ islogin: false, message: 'Unable to log in' });
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

// Update HOD (Admin) details
exports.update_hod = async (req, res) => {
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
