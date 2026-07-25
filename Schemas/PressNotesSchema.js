const con = require('../apis/config');

exports.press_notes_table = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS press_notes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      release_date DATE NOT NULL,
      release_time TIME NOT NULL,
      title VARCHAR(255) NOT NULL,
      image_path VARCHAR(255) DEFAULT NULL,
      source_file_path VARCHAR(255) DEFAULT NULL,
      source_file_type VARCHAR(80) DEFAULT NULL,
      extracted_text LONGTEXT,
      body_text LONGTEXT NOT NULL,
      added_by VARCHAR(150) DEFAULT NULL,
      is_published BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_press_notes_release (release_date, release_time),
      INDEX idx_press_notes_published (is_published)
    )
  `;

  con.query(sql, (err) => {
    if (err) {
      console.error('Press notes table not created:', err.message);
      return;
    }
    console.log('Press notes table ready');
  });
};
