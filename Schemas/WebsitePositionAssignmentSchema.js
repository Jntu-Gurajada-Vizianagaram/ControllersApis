const connection = require('../apis/config');

const ensureColumn = (column, definition) => {
  connection.query('SHOW COLUMNS FROM website_position_assignments LIKE ?', [column], (error, rows) => {
    if (error || rows.length) return;
    connection.query(`ALTER TABLE website_position_assignments ADD COLUMN ${column} ${definition}`, (alterError) => {
      if (alterError) {
        console.error(`Unable to add website_position_assignments.${column}:`, alterError.message);
      }
    });
  });
};

exports.website_position_assignments_table = () => {
  connection.query(
    `CREATE TABLE IF NOT EXISTS website_position_assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      person_id INT NOT NULL,
      position_type VARCHAR(80) NOT NULL DEFAULT 'administration',
      position_key VARCHAR(120) NOT NULL,
      position_label VARCHAR(255) NOT NULL,
      directorate_name VARCHAR(255),
      title_override VARCHAR(255),
      subtitle_override VARCHAR(500),
      email_override VARCHAR(255),
      website_url VARCHAR(500),
      is_incharge BOOLEAN NOT NULL DEFAULT FALSE,
      visibility VARCHAR(40) NOT NULL DEFAULT 'public',
      status VARCHAR(40) NOT NULL DEFAULT 'active',
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY website_position_assignments_key_uq (position_key),
      INDEX website_position_assignments_person_idx (person_id),
      INDEX website_position_assignments_public_idx (position_type, visibility, status)
    )`,
    (error) => {
      if (error) {
        console.error('Website position assignments table not created:', error.message);
        return;
      }

      ensureColumn('person_id', 'INT NOT NULL');
      ensureColumn('position_type', "VARCHAR(80) NOT NULL DEFAULT 'administration'");
      ensureColumn('position_key', 'VARCHAR(120) NOT NULL');
      ensureColumn('position_label', 'VARCHAR(255) NOT NULL');
      ensureColumn('directorate_name', 'VARCHAR(255)');
      ensureColumn('title_override', 'VARCHAR(255)');
      ensureColumn('subtitle_override', 'VARCHAR(500)');
      ensureColumn('email_override', 'VARCHAR(255)');
      ensureColumn('website_url', 'VARCHAR(500)');
      ensureColumn('is_incharge', 'BOOLEAN NOT NULL DEFAULT FALSE');
      ensureColumn('visibility', "VARCHAR(40) NOT NULL DEFAULT 'public'");
      ensureColumn('status', "VARCHAR(40) NOT NULL DEFAULT 'active'");
      ensureColumn('sort_order', 'INT NOT NULL DEFAULT 0');
    },
  );
};
