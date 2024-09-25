const express = require('express');
const router = express.Router();
const galleryApi = require('../../apis/gallery_api/galleryApi');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './storage/gallery/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Route to upload multiple gallery images and save each image's data to the database
router.post('/add-gallery-images', upload.array('files'), galleryApi.addGalleryImages);

// Route to get all gallery images
router.get('/all-gallery-images', galleryApi.getAllGalleryImages);

// Route to serve a specific image file by filename
router.get('/image/:filename', galleryApi.getImageByFilename);

// Route to delete a specific gallery image
router.delete('/delete-gallery-image/:id', galleryApi.deleteGalleryImage);

module.exports = router;