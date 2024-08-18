const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const con = require('../config');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/gallery');
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

router.post('/add-gallery-images', upload.array('files'), (req, res) => {
  const { event_name, uploaded_date, description, main_page, admin_approval, added_by } = req.body;
  const files = req.files;

  con.query('INSERT INTO gallery_requests SET ?', { event_name, uploaded_date, description, main_page, admin_approval, added_by }, (err, result) => {
    if (err) return res.status(500).json({ error: err });

    const requestId = result.insertId;
    const galleryImages = files.map(file => [requestId, file.filename]);

    con.query('INSERT INTO gallery_images (request_id, filename) VALUES ?', [galleryImages], (err) => {
      if (err) return res.status(500).json({ error: err });
      res.status(200).json({ message: 'Files uploaded successfully' });
    });
  });
});

router.get('/all-gallery-images', (req, res) => {
  con.query(`
    SELECT r.id, r.event_name, r.uploaded_date, r.description, r.main_page, r.admin_approval, r.added_by, GROUP_CONCAT(i.filename) AS filenames
    FROM gallery_requests r
    JOIN gallery_images i ON r.id = i.request_id
    GROUP BY r.id`, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(results);
  });
});

router.delete('/delete-gallery-image/:id', (req, res) => {
  const id = req.params.id;

  con.query('SELECT filename FROM gallery_images WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'Image not found' });

    const filename = results[0].filename;
    fs.unlink(path.join(__dirname, '../uploads/gallery', filename), (err) => {
      if (err) return res.status(500).json({ error: 'Failed to delete image from server' });

      con.query('DELETE FROM gallery_images WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.status(200).json({ message: 'Image deleted successfully' });
      });
    });
  });
});

module.exports = router;
