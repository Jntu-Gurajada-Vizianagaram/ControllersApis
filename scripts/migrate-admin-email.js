const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const connection = require('../apis/config');
const { normalizeEmail, isOrganizationEmail } = require('../apis/admin_api/emailPolicy');

const [legacyUsername, requestedEmail] = process.argv.slice(2);
const email = normalizeEmail(requestedEmail);

if (!legacyUsername || !isOrganizationEmail(email)) {
  console.error('Usage: npm run migrate-admin-email -- <current-username> <username@jntugv.edu.in>');
  process.exitCode = 1;
} else {
  const migrate = async () => {
    const db = connection.promise();
    try {
      await db.beginTransaction();
      const [result] = await db.execute(
        'UPDATE admins SET username = ?, google_sub = NULL WHERE username = ?',
        [email, legacyUsername],
      );
      if (!result.affectedRows) throw new Error('Legacy administrator was not found');
      await db.execute(
        `INSERT INTO admin_email_allowlist (email, enabled) VALUES (?, TRUE)
         ON DUPLICATE KEY UPDATE enabled = TRUE`,
        [email],
      );
      await db.commit();
      console.log(`Administrator migrated to ${email}`);
    } catch (error) {
      await db.rollback();
      console.error(`Migration failed: ${error.message}`);
      process.exitCode = 1;
    } finally {
      connection.end();
    }
  };
  migrate();
}
