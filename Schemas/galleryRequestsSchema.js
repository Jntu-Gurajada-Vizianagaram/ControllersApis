const con = require('../apis/config.js');

exports.gallery_requests = () => {
  try {
        // Drop existing gallery_requests table if it exists
        const dropGalleryRequestsQuery = `DROP TABLE IF EXISTS gallery_requests;`;
        con.query(dropGalleryRequestsQuery, (err, result) => {
          if (err) {
            console.error('Error dropping gallery_requests table:', err);
          } else {
            console.log('gallery_requests table dropped successfully.');
          }
        });

    // Drop existing gallery_images table if it exists
    const dropGalleryImagesQuery = `DROP TABLE IF EXISTS gallery_images;`;
    con.query(dropGalleryImagesQuery, (err, result) => {
      if (err) {
        console.error('Error dropping gallery_images table:', err);
      } else {
        console.log('gallery_images table dropped successfully.');
      }
    });

    // Create the new galleryimages table
    const createGalleryImagesTable = `
      CREATE TABLE IF NOT EXISTS galleryimages (
        id SERIAL PRIMARY KEY,                          -- Auto-incrementing unique identifier
        filepath VARCHAR(255) NOT NULL,                 -- Path where the image is stored on the server
        imagelink VARCHAR(255) NOT NULL,                -- Link to access the image, usually a URL
        description TEXT,                               -- Description of the image
        uploaded_date DATE NOT NULL,                    -- Date the image was uploaded
        event_name VARCHAR(255),                        -- Name of the event associated with the image
        main_page BOOLEAN DEFAULT FALSE,                -- Indicates if the image should be on the main page
        admin_approval VARCHAR(50) DEFAULT 'pending',   -- Status of admin approval (e.g., pending, approved)
        added_by VARCHAR(100)                           -- Username or identifier of the person who uploaded the image
      );
    `;

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
