const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connection = require('../apis/config');

const createStatements = [
  `CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    google_sub VARCHAR(255) NULL,
    UNIQUE KEY uq_admins_google_sub (google_sub)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS admins_profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    department VARCHAR(255) NOT NULL,
    about VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS admin_email_allowlist (
    email VARCHAR(255) PRIMARY KEY,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_by INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS affiliated_colleges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    logo VARCHAR(500) NOT NULL,
    college_name VARCHAR(255) NOT NULL,
    college_address VARCHAR(255) NOT NULL,
    college_link VARCHAR(255) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS carousel_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filepath VARCHAR(200) NOT NULL,
    description VARCHAR(500) NOT NULL,
    added_by VARCHAR(100) NOT NULL,
    display_order VARCHAR(50) NOT NULL,
    admin_approval VARCHAR(50) NOT NULL,
    main_page VARCHAR(20) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS directors (
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
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS dmc_upload (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date VARCHAR(150) NOT NULL,
    title VARCHAR(500) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    description VARCHAR(500) NOT NULL,
    submitted VARCHAR(100) NOT NULL,
    admin_approval VARCHAR(100) NOT NULL,
    carousel_scrolling VARCHAR(100) NOT NULL,
    gallery_scrolling VARCHAR(50) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS event_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uploaded_date VARCHAR(150) NOT NULL,
    event_name VARCHAR(250) NOT NULL,
    description VARCHAR(500) NOT NULL,
    added_by VARCHAR(100) NOT NULL,
    admin_approval VARCHAR(50) NOT NULL,
    main_page VARCHAR(20) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS galleryimages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    filepath VARCHAR(255) NOT NULL,
    description TEXT,
    uploaded_date DATE NOT NULL,
    event_name VARCHAR(255),
    added_by VARCHAR(100)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS notification_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date VARCHAR(150) NOT NULL,
    title VARCHAR(500) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    external_text VARCHAR(2083),
    external_link VARCHAR(500),
    main_page VARCHAR(50) NOT NULL,
    scrolling VARCHAR(50) NOT NULL,
    update_type VARCHAR(50) NOT NULL,
    update_status VARCHAR(50) NOT NULL,
    submitted_by VARCHAR(45) NOT NULL,
    admin_approval VARCHAR(45) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS user_sessions (
    sid VARCHAR(128) PRIMARY KEY,
    expires BIGINT UNSIGNED NOT NULL,
    data LONGTEXT NOT NULL,
    INDEX idx_user_sessions_expires (expires)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

const managedTables = [
  'admins',
  'admins_profile',
  'admin_email_allowlist',
  'affiliated_colleges',
  'carousel_photos',
  'directors',
  'dmc_upload',
  'event_photos',
  'galleryimages',
  'notification_updates',
  'user_sessions',
];

const columnExists = async (db, table, column) => {
  const [rows] = await db.execute(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [table, column],
  );
  return rows.length > 0;
};

const indexExists = async (db, table, index) => {
  const [rows] = await db.execute(
    `SELECT 1 FROM information_schema.statistics
     WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?`,
    [table, index],
  );
  return rows.length > 0;
};

const migrate = async () => {
  const db = connection.promise();

  try {
    for (const statement of createStatements) await db.query(statement);

    if (!(await columnExists(db, 'admins', 'google_sub'))) {
      await db.query('ALTER TABLE admins ADD COLUMN google_sub VARCHAR(255) NULL AFTER role');
    }
    if (!(await indexExists(db, 'admins', 'uq_admins_google_sub'))) {
      await db.query('ALTER TABLE admins ADD UNIQUE INDEX uq_admins_google_sub (google_sub)');
    }

    await db.query('ALTER TABLE galleryimages MODIFY id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT');
    await db.query('ALTER TABLE notification_updates MODIFY external_text VARCHAR(2083) NULL');
    await db.query('ALTER TABLE notification_updates MODIFY external_link VARCHAR(500) NULL');

    for (const table of managedTables) {
      await db.query(
        `ALTER TABLE \`${table}\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      );
    }

    console.log('Database schema migration completed.');
  } catch (error) {
    console.error(`Database schema migration failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    connection.end();
  }
};

migrate();
