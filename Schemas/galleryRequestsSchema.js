const con = require('../apis/config.js');

exports.gallery_requests = () => {
  try {
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
        console.error('Error creating table:', err);
      } else {
        console.log('Table created successfully');
      }
    });

    // Alter column name from imagelink to filepath
    const alterColumnName = `
      ALTER TABLE galleryimages
      CHANGE COLUMN imagelink filepath VARCHAR(255) NOT NULL;
    `;

    // Execute the ALTER TABLE query
    con.query(alterColumnName, (err, result) => {
      if (err) {
        console.error('Error altering column name:', err);
      } else {
        console.log('Requested column name changed');
      }
    });

    // Update the filepath in the galleryimages table
    const updateFilepath = `
      UPDATE jntugv.galleryimages
      SET filepath = REPLACE(filepath, 'https://api.jntugv.edu.in/api/gallery/image/', '')
      WHERE filepath LIKE 'https://api.jntugv.edu.in/api/gallery/image/%';
    `;

    // Execute the UPDATE query
    con.query(updateFilepath, (err, result) => {
      if (err) {
        console.error('Error updating filepath:', err);
      } else {
        console.log('Data updated successfully');
      }
    });

  } catch (err) {
    console.error('Error in table creation, alteration or update:', err);
  }
};
