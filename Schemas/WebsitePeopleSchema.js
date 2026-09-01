const connection = require('../apis/config');

const ensureColumn = (column, definition) => {
  connection.query('SHOW COLUMNS FROM website_people LIKE ?', [column], (error, rows) => {
    if (error || rows.length) return;
    connection.query(`ALTER TABLE website_people ADD COLUMN ${column} ${definition}`, (alterError) => {
      if (alterError) {
        console.error(`Unable to add website_people.${column}:`, alterError.message);
      }
    });
  });
};

exports.website_people_table = () => {
  connection.query(
    `CREATE TABLE IF NOT EXISTS website_people (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(80),
      department VARCHAR(255),
      academic_title VARCHAR(255),
      qualifications VARCHAR(500),
      image_url VARCHAR(1000),
      about MEDIUMTEXT,
      status VARCHAR(40) NOT NULL DEFAULT 'active',
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX website_people_status_idx (status),
      UNIQUE KEY website_people_email_uq (email)
    )`,
    (error) => {
      if (error) {
        console.error('Website people table not created:', error.message);
        return;
      }

      ensureColumn('phone', 'VARCHAR(80)');
      ensureColumn('department', 'VARCHAR(255)');
      ensureColumn('academic_title', 'VARCHAR(255)');
      ensureColumn('qualifications', 'VARCHAR(500)');
      ensureColumn('image_url', 'VARCHAR(1000)');
      ensureColumn('about', 'MEDIUMTEXT');
      ensureColumn('status', "VARCHAR(40) NOT NULL DEFAULT 'active'");
      ensureColumn('sort_order', 'INT NOT NULL DEFAULT 0');
    },
  );
};
