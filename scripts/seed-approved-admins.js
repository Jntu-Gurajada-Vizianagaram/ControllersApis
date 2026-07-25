const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const connection = require('../apis/config');

const ensureTables = async (db) => {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      username VARCHAR(255) NOT NULL UNIQUE KEY,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      google_sub VARCHAR(255) NULL,
      UNIQUE KEY uq_admins_google_sub (google_sub)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS admin_email_allowlist (
      email VARCHAR(255) PRIMARY KEY,
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      created_by INT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
};

const approvedAdmins = [
  { name: 'DMC Root Administrator', email: 'dmc@jntugv.edu.in', role: 'RootAdmin' },
  { name: 'Data Processing Officer', email: 'dataprocessingofficer@jntugv.edu.in', role: 'Developer' },
  { name: 'Programmer', email: 'programmer@jntugv.edu.in', role: 'Developer' },
  { name: 'DPO', email: 'dpo@jntugv.edu.in', role: 'Developer' },
  { name: 'DMC Web Designer', email: 'webdesignerdmc@jntugv.edu.in', role: 'WebAdmin' },
];

const seed = async () => {
  const db = await connection.promise().getConnection();

  try {
    await ensureTables(db);
    await db.beginTransaction();

    for (const admin of approvedAdmins) {
      // Google-only accounts still need a non-null password column. The random
      // value is not disclosed, so password login remains unavailable until a
      // RootAdmin deliberately assigns a password through the admin console.
      const randomPassword = crypto.randomBytes(48).toString('base64url');
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      await db.execute(
        `INSERT INTO admins (name, username, password, role)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role)`,
        [admin.name, admin.email, passwordHash, admin.role],
      );

      await db.execute(
        `INSERT INTO admin_email_allowlist (email, enabled)
         VALUES (?, TRUE)
         ON DUPLICATE KEY UPDATE enabled = TRUE`,
        [admin.email],
      );
    }

    await db.commit();
    console.log(`Approved ${approvedAdmins.length} organizational administrator accounts.`);
  } catch (error) {
    await db.rollback();
    console.error(`Unable to seed approved administrators: ${error.message}`);
    process.exitCode = 1;
  } finally {
    db.release();
    connection.end();
  }
};

seed();
