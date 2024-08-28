const con =require('../apis/config')
exports.gallery_requests = () => {
  try {
    // Create gallery_requests table
    const galleryRequestsQuery = `
      CREATE TABLE IF NOT EXISTS gallery_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_name VARCHAR(255) NOT NULL,
        uploaded_date DATE NOT NULL,
        description TEXT,
        main_page ENUM('yes', 'no') NOT NULL,
        admin_approval ENUM('pending', 'approved', 'denied') NOT NULL DEFAULT 'pending',
        added_by VARCHAR(255) NOT NULL
      );
    `;

    con.query(galleryRequestsQuery, (err, result) => {
      if (err) {
        console.error('Error creating gallery_requests table:', err);
      }
    });

    // Create gallery_images table
    const galleryImagesQuery = `
      CREATE TABLE IF NOT EXISTS gallery_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT,
        filename VARCHAR(255) NOT NULL,
        FOREIGN KEY (request_id) REFERENCES gallery_requests(id) ON DELETE CASCADE
      );
    `;

    con.query(galleryImagesQuery, (err, result) => {
      if (err) {
        console.error('Error creating gallery_images table:', err);
      }
    });

  } catch (err) {
    console.error('Error in table creation:', err);
  }
};
