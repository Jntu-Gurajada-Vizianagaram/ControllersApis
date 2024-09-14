const con = require('../apis/config.js');

exports.deleteGalleryImages = () => {
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
