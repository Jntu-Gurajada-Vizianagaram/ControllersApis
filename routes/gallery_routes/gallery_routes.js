const express = require('express');
const router = express.Router();
const galleryApi = require('../../apis/gallery_api/galleryApi');
const multer = require('multer');
const fs = require('fs');
const { requireRoles } = require('../../middleware/auth');
const { safeFilename, imageFileFilter } = require('../../utils/uploads');
const galleryEditor = requireRoles('Admin', 'Developer', 'WebAdmin');
const deleteOnly = requireRoles('Admin');
const galleryDirectory = './storage/gallery/';
fs.mkdirSync(galleryDirectory, { recursive: true });

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, galleryDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, safeFilename(file));
  }
});

const upload = multer({
  storage,
  limits: { files: 60, fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

// Route to upload multiple gallery images and save each image's data to the database
router.post('/add-gallery-images', galleryEditor, upload.array('files'), galleryApi.addGalleryImages);

// Route to get all gallery images
router.get('/all-gallery-images', galleryApi.getAllGalleryImages);

// Route to serve a specific image file by filename
router.get('/image/:filename', galleryApi.getImageByFilename);

// Route to delete a specific gallery image
router.delete('/delete-gallery-image/:id', deleteOnly, galleryApi.deleteGalleryImage);

module.exports = router;
