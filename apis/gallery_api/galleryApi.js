require('dotenv').config(); // This line should be at the very top of the file
const connection = require('../config');
const fs = require('fs');
const path = require('path');

const api_ip = process.env.domainIp;

exports.addGalleryImages = (req, res) => {
  const files = req.files;
  const galleryUpload = req.body;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const sql = 'INSERT INTO galleryimages (filepath, description, uploaded_date, event_name, added_by) VALUES ?';
  const values = files.map(file => [
    file.filename,
    galleryUpload.description,
    new Date(),
    galleryUpload.event_name,
    galleryUpload.added_by
  ]);

  connection.query(sql, [values], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).json({ error: 'Error inserting data' });
      return;
    }
    res.json({ message: 'Images uploaded successfully' });
  });
};

exports.getAllGalleryImages = (req, res) => {
  const sql = "SELECT * FROM galleryimages ORDER BY id DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err}` });
      return;
    }

    const img_list = results.map(img => {
      const img_link = `${api_ip}/gallery/image/${img.filepath}`;

      return {
        ...img,
        imagelink: img_link
      };
    });

    res.json(img_list);
  });
};

exports.getImageByFilename = (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join('./storage/gallery/', filename);

  fs.access(filepath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File does not exist:', err);
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    res.sendFile(filepath);
  });
};

exports.deleteGalleryImage = (req, res) => {
  const id = req.params.id;
  const sel = `SELECT * FROM galleryimages WHERE id = ?`;
  const del = `DELETE FROM galleryimages WHERE id = ?`;
  
  connection.query(sel, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data:', err);
      res.status(500).json({ error: 'Error deleting data' });
      return;
    }
    
    if (result.length === 0) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    const filepath = path.join('./storage/gallery/', result[0].filepath);
    
    connection.query(del, [id], (err, result) => {
      if (err) {
       
        res.status(500).json({ error: 'Error deleting record' });
        return;
      }

      fs.unlink(filepath, (err) => {
        if (err) {
          console.error('Error removing file:', err);
        }
      });

      res.json({ message: 'Image deleted successfully', result });
    });
  });
};