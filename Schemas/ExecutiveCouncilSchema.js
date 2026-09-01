const con = require('../apis/config');

const ensureColumn = (column, definition) => {
  con.query('SHOW COLUMNS FROM executive_council_members LIKE ?', [column], (error, rows) => {
    if (error || rows.length) return;
    con.query(`ALTER TABLE executive_council_members ADD COLUMN ${column} ${definition}`, (alterError) => {
      if (alterError) console.error(`Unable to add executive_council_members.${column}:`, alterError.message);
    });
  });
};

exports.executive_council_table = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS executive_council_members (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      role_in_ec VARCHAR(255) NOT NULL DEFAULT '',
      designation VARCHAR(255) NOT NULL DEFAULT '',
      affiliation VARCHAR(500) NOT NULL DEFAULT '',
      image_url VARCHAR(700) NULL,
      sort_order INT NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_executive_council_active_sort (is_active, sort_order, id)
    )
  `;

  con.query(sql, (err) => {
    if (err) {
      console.error('Executive council table not created:', err.message);
      return;
    }

    ensureColumn('role_in_ec', "VARCHAR(255) NOT NULL DEFAULT ''");
    ensureColumn('designation', "VARCHAR(255) NOT NULL DEFAULT ''");
    ensureColumn('affiliation', "VARCHAR(500) NOT NULL DEFAULT ''");
    ensureColumn('image_url', 'VARCHAR(700) NULL');
    ensureColumn('sort_order', 'INT NOT NULL DEFAULT 0');
    ensureColumn('is_active', 'BOOLEAN NOT NULL DEFAULT TRUE');
  });
};
