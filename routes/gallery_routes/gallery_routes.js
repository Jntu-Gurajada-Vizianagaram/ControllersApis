const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const con = require('../../apis/config.js');

const router = express.Router();

// Replace with your server's IP address or domain
const server_ip = 'https://api.jntugv.edu.in' || 'http://localhost:8888';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../storage/gallery');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Route to upload multiple gallery images and save each image's data to the database
router.post('/add-gallery-images', upload.array('files'), async (req, res) => {
  const { event_name, uploaded_date, description, main_page, admin_approval, added_by } = req.body;
  const files = req.files;

  const galleryImages = files.map(file => {
    const filePath = path.join('../../storage/gallery', file.filename);
    const imagelink = `${server_ip}/api/gallery/image/${file.filename}`;
    return {
      filepath: filePath,
      imagelink,
      description,
      uploaded_date,
      event_name,
      main_page: main_page === 'yes',
      admin_approval,
      added_by
    };
  });

  const insertImagesQuery = 'INSERT INTO galleryimages SET ?';

  try {
    await Promise.all(galleryImages.map(imageData => {
      return new Promise((resolve, reject) => {
        con.query(insertImagesQuery, imageData, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
    }));
    res.status(200).json({ message: 'Files uploaded and data saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Route to get all gallery images
router.get('/all-gallery-images', (req, res) => {
  const getAllImagesQuery = 'SELECT * FROM galleryimages';

  con.query(getAllImagesQuery, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(results);
  });
});

// Route to serve a specific image file by filename
router.get('/image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../../storage/gallery', filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.sendFile(filePath);
  });
});

// Route to delete a specific gallery image
router.delete('/delete-gallery-image/:id', (req, res) => {
  const id = req.params.id;

  con.query('SELECT filepath FROM galleryimages WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'Image not found' });

    const filepath = path.join(__dirname, '..', results[0].filepath);
    fs.unlink(filepath, (err) => {
      if (err) return res.status(500).json({ error: 'Failed to delete image from server' });

      con.query('DELETE FROM galleryimages WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.status(200).json({ message: 'Image deleted successfully' });
      });
    });
  });
});

module.exports = router;
