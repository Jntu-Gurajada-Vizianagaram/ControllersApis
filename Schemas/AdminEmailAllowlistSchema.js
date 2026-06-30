const connection = require('../apis/config');

exports.admin_email_allowlist_table = () => {
  connection.query(`
    CREATE TABLE IF NOT EXISTS admin_email_allowlist (
      email VARCHAR(255) PRIMARY KEY,
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      created_by INT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `, (error) => {
    if (error) {
      console.error('Unable to create admin email allowlist:', error.message);
      return;
    }
    connection.query(`
      INSERT IGNORE INTO admin_email_allowlist (email, enabled)
      SELECT LOWER(TRIM(username)), TRUE
      FROM admins
      WHERE LOWER(TRIM(username)) LIKE '%@jntugv.edu.in'
    `);
  });
};
