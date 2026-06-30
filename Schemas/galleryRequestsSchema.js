const con = require('../apis/config.js');

exports.gallery_requests = () => {
  try {
    // Create the galleryimages table if it doesn't exist
    const createGalleryImagesTable = `
      CREATE TABLE IF NOT EXISTS galleryimages (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        filepath VARCHAR(255) NOT NULL,
        description TEXT,                               -- Description of the image
        uploaded_date DATE NOT NULL,                    -- Date the image was uploaded
        event_name VARCHAR(255),                        -- Name of the event associated with the image
        added_by VARCHAR(100)                           -- Username or identifier of the person who uploaded the image
      );
    `;

    // Execute the CREATE TABLE query
    con.query(createGalleryImagesTable, (err, result) => {
      if (err) {
        console.error('Error creating table:', err);
      } else {
        con.query("SHOW COLUMNS FROM galleryimages LIKE 'filepath'", (filepathError, filepathColumns) => {
          if (filepathError || filepathColumns.length) return;
          con.query("SHOW COLUMNS FROM galleryimages LIKE 'imagelink'", (legacyError, legacyColumns) => {
            if (!legacyError && legacyColumns.length) {
              con.query('ALTER TABLE galleryimages CHANGE imagelink filepath VARCHAR(255) NOT NULL');
            }
          });
        });
      }
    });
  } catch (err) {
    console.error('Error in table creation', err);
  }
};
