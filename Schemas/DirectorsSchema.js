const connection = require('../apis/config');

exports.directors_table = () => {
  connection.query(`
    CREATE TABLE IF NOT EXISTS directors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      academic_position_id VARCHAR(100) NOT NULL,
      department_id VARCHAR(100) NOT NULL,
      directorate_id VARCHAR(100) NOT NULL,
      profile_url VARCHAR(500),
      personal_website VARCHAR(500),
      photo_path VARCHAR(255),
      is_incharge BOOLEAN NOT NULL DEFAULT FALSE
    )
  `, (error) => {
    if (error) console.error('Unable to create directors table:', error.message);
  });
};
