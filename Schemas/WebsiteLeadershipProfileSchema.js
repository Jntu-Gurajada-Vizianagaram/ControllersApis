const connection = require('../apis/config');

const ensureColumn = (column, definition) => {
  connection.query(`SHOW COLUMNS FROM website_leadership_profiles LIKE ?`, [column], (error, rows) => {
    if (error || rows.length) return;
    connection.query(`ALTER TABLE website_leadership_profiles ADD COLUMN ${column} ${definition}`, (alterError) => {
      if (alterError) {
        console.error(`Unable to add website_leadership_profiles.${column}:`, alterError.message);
      }
    });
  });
};

exports.website_leadership_profiles_table = () => {
  connection.query(
    `CREATE TABLE IF NOT EXISTS website_leadership_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      page_key VARCHAR(120) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      title VARCHAR(255) NULL,
      subtitle VARCHAR(500) NULL,
      email VARCHAR(255) NULL,
      phone VARCHAR(80) NULL,
      department VARCHAR(255) NULL,
      unit VARCHAR(255) NULL,
      image_url VARCHAR(1000) NULL,
      about MEDIUMTEXT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      visibility VARCHAR(40) NOT NULL DEFAULT 'public',
      status VARCHAR(40) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX website_leadership_profiles_page_idx (page_key),
      INDEX website_leadership_profiles_public_idx (visibility, status)
    )`,
    (error) => {
      if (error) {
        console.error('Website leadership profiles table not created:', error.message);
        return;
      }
      ensureColumn('title', 'VARCHAR(255) NULL');
      ensureColumn('subtitle', 'VARCHAR(500) NULL');
      ensureColumn('email', 'VARCHAR(255) NULL');
      ensureColumn('phone', 'VARCHAR(80) NULL');
      ensureColumn('department', 'VARCHAR(255) NULL');
      ensureColumn('unit', 'VARCHAR(255) NULL');
      ensureColumn('image_url', 'VARCHAR(1000) NULL');
      ensureColumn('about', 'MEDIUMTEXT NULL');
      ensureColumn('sort_order', 'INT NOT NULL DEFAULT 0');
      ensureColumn('visibility', "VARCHAR(40) NOT NULL DEFAULT 'public'");
      ensureColumn('status', "VARCHAR(40) NOT NULL DEFAULT 'active'");
      ensureColumn('created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      ensureColumn('updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    },
  );
};
