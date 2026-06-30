const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const connection = require('../apis/config');

const approvedAdmins = [
  { name: 'DMC Root Administrator', email: 'dmc@jntugv.edu.in', role: 'RootAdmin' },
  { name: 'Data Processing Officer', email: 'dataprocessingofficer@jntugv.edu.in', role: 'Developer' },
  { name: 'Programmer', email: 'programmer@jntugv.edu.in', role: 'Developer' },
  { name: 'DPO', email: 'dpo@jntugv.edu.in', role: 'Developer' },
  { name: 'DMC Web Designer', email: 'webdesignerdmc@jntugv.edu.in', role: 'WebAdmin' },
];

const seed = async () => {
  const db = connection.promise();

  try {
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
    connection.end();
  }
};

seed();
