const con = require('../apis/config.js');

exports.gallery_requests = () => {
  try {
    // Drop specific columns from the galleryimages table
    const alterGalleryImagesTable = `
      ALTER TABLE jntugv.galleryimages 
      DROP COLUMN admin_approval,
      DROP COLUMN main_page,
      DROP COLUMN filepath;
    `;

    // Execute the ALTER TABLE query
    con.query(alterGalleryImagesTable, (err, result) => {
      if (err) {
        console.error('Error altering galleryimages table:', err);
      } else {
        console.log('Columns dropped successfully from galleryimages table.');
      }
    });

    // Create the galleryimages table if it doesn't exist
    const createGalleryImagesTable = `
      CREATE TABLE IF NOT EXISTS galleryimages (
        id SERIAL PRIMARY KEY,                          -- Auto-incrementing unique identifier
        imagelink VARCHAR(255) NOT NULL,                -- Link to access the image, usually a URL
        description TEXT,                               -- Description of the image
        uploaded_date DATE NOT NULL,                    -- Date the image was uploaded
        event_name VARCHAR(255),                        -- Name of the event associated with the image
        added_by VARCHAR(100)                           -- Username or identifier of the person who uploaded the image
      );
    `;

    // Execute the CREATE TABLE query
    con.query(createGalleryImagesTable, (err, result) => {
      if (err) {
        console.error('Error creating galleryimages table:', err);
      } else {
        console.log('galleryimages table created successfully.');
      }
    });

  } catch (err) {
    console.error('Error in table creation:', err);
  }
};
