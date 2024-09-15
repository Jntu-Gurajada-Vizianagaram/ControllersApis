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
        console.error('Error creating  table:', err);
      } else {
        // console.log('');
      }
    });

  } catch (err) {
    console.error('Error in table creation:', err);
  }
  
  try {
    const deleteImagesQuery = `
      DELETE FROM galleryimages
      WHERE id BETWEEN 142 AND 151;
    `;

    // Execute the DELETE query
    con.query(deleteImagesQuery, (err, result) => {
      if (err) {
        console.error('Error deleting images:', err);
      } else {
        console.log('Images deleted successfully');
      }
    });

  } catch (err) {
    console.error('Error in deletion process:', err);
  }

};
