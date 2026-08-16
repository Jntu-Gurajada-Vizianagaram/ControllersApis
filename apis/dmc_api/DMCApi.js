require('dotenv').config();
const multer = require('multer');
const connection = require('../config');
const con = require('../config');
const api_ip = process.env.domainIp;
const fs = require('fs');
const path = require('path');
const { safeFilename, safeEventName, imageFileFilter } = require('../../utils/uploads');
fs.mkdirSync('./storage/dmc/', { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, './storage/dmc/');
  },
  filename: (req, file, cb) => {
    return cb(null, safeFilename(file));
  }
});

exports.dmcUpload = multer({
  storage,
  limits: { files: 1, fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFileFilter,
}).single('file');

exports.insert_img = (req, res) => {
  const dmcupload = req.body;
  const file = req.file;
  const int = 0;
  const sql = 'INSERT INTO dmc_upload (id, date, title, file_path, description, submitted, admin_approval, carousel_scrolling, gallery_scrolling) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  if (!file) {
    return res.status(400).json({ error: 'An image file is required' });
  }
  const values = [int, dmcupload.date, dmcupload.title, file.filename, dmcupload.description, dmcupload.submitted, 'accepted', dmcupload.carousel_scrolling, dmcupload.gallery_scrolling];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).json({ error: 'Error inserting data' });
      return;
    }
    res.json({ message: 'Data inserted successfully' });
  });
};

exports.delete_img = (req, res) => {
  const id = req.params.id;
  const sel = 'SELECT * FROM dmc_upload WHERE id = ?';
  const del = 'DELETE FROM dmc_upload WHERE id = ?';
  
  connection.query(sel, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data:', err);
      res.status(500).json({ error: 'Error deleting data' });
      return;
    }
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    const filepath = path.join('./storage/dmc', result[0].file_path);
    
    connection.query(del, [id], (err, deleteResult) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: 'No Records Found!' });
        return;
      } else {
        fs.access(filepath, fs.constants.F_OK, (err) => {
          if (err) {
            console.error('File does not exist');
            return res.json({ message: 'Record deleted; file was already missing' });
          }
          
          fs.unlink(filepath, (err) => {
            if (err) {
              console.error('Error removing file:', err);
              return res.status(500).json({ error: 'Record deleted but file cleanup failed' });
            }
            res.json({ message: 'Data deleted successfully', result: deleteResult });
          });
        });
      }
    });
  });
};

exports.all_imgs = (req, res) => {
  const sql = "SELECT * FROM dmc_upload ORDER BY id DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err}` });
      return;
    }

    const img_list = results.map(img => {
      const img_link = `${api_ip}/dmc/${img.file_path}`;

      return {
        ...img,
        imglink: img_link
      };
    });

    res.json(img_list);
  });
};

exports.carousel_imgs = (req, res) => {
  const sql = "SELECT * FROM dmc_upload WHERE admin_approval='accepted' AND carousel_scrolling='yes' ORDER BY id DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err}` });
      return;
    }

    const img_list = results.map(img => {
      const img_link = `${api_ip}/dmc/${img.file_path}`;

      return {
        ...img,
        imglink: img_link
      };
    });

    res.json(img_list);
  });
};

exports.remove_from_carousel = (req, res) => {
  const img_id = req.params.imgid;
  const query1 = "SELECT * FROM dmc_upload WHERE id = ? AND carousel_scrolling = 'yes'";
  const query2 = "UPDATE dmc_upload SET carousel_scrolling = 'no', admin_approval = 'accepted' WHERE id = ?";
  con.query(query1, [img_id], (err, result1) => {
    if (err) {
      console.log(err);
    } else {
      con.query(query2, [img_id], (err, result2) => {
        if (err) {
          console.log(err);
        } else {
          res.json({ message: `${img_id}`, result: result2 });
        }
      });
    }
  });
};

exports.add_to_carousel = (req, res) => {
  const img_id = req.params.imgid;
  const query1 = "SELECT * FROM dmc_upload WHERE id = ? AND carousel_scrolling = 'no'";
  const query2 = "UPDATE dmc_upload SET carousel_scrolling = 'yes', admin_approval = 'accepted' WHERE id = ?";
  con.query(query1, [img_id], (err, result1) => {
    if (err) {
      console.log(err);
    } else {
      con.query(query2, [img_id], (err, result2) => {
        if (err) {
          console.log(err);
        } else {
          res.json({ message: `${img_id}`, result: result2 });
        }
      });
    }
  });
};

exports.update_carousel_image = (req, res) => {
  const uploadId = req.params.id;
  const dmcupload = req.body.dmcupload; // Access the nested dmcupload object
  let file_path = dmcupload.filepath;

    // If a new file was uploaded, update the file_path
  if (req.file) {
    file_path = req.file.filename;
    
    // Delete the old file if it exists
    if (dmcupload.filepath) {
      const oldFilePath = path.join('./storage/dmc/', dmcupload.filepath);
      fs.unlink(oldFilePath, (err) => {
        if (err) console.error('Error deleting old file:', err);
      });
    }
  }

  // First, select the existing record
  const selectSql = 'SELECT * FROM dmc_upload WHERE id = ?';
  connection.query(selectSql, [uploadId], (selectErr, selectResult) => {
    if (selectErr) {
      console.error('Error selecting data:', selectErr);
      res.status(500).json({ error: 'Error selecting data' });
      return;
    }

    if (selectResult.length === 0) {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    const existingData = selectResult[0];

    // Now update the record
    const updateSql = 'UPDATE dmc_upload SET date=?, title=?, file_path=?, description=?, submitted=?, admin_approval=?, carousel_scrolling=?, gallery_scrolling=? WHERE id=?';
    const values = [
      dmcupload.date || existingData.date,
      dmcupload.title || existingData.title,
      file_path || existingData.file_path,
      dmcupload.description || existingData.description,
      dmcupload.submitted || existingData.submitted,
      'accepted',
      dmcupload.carousel_scrolling || existingData.carousel_scrolling,
      dmcupload.gallery_scrolling || existingData.gallery_scrolling,
      uploadId
    ];

    connection.query(updateSql, values, (updateErr, updateResult) => {
      if (updateErr) {
        console.error('Error updating data:', updateErr);
        res.status(500).json({ error: 'Error updating data' });
        return;
      }
      res.json({ message: 'Data updated successfully', file_path: file_path });
    });
  });
};

const bulkstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let event_name;
    try {
      event_name = safeEventName(req.body.event_name);
    } catch (error) {
      return cb(error);
    }
    const folderpath = path.join(__dirname, '..', '..', 'storage', 'dmc', 'events', event_name);
    if (!fs.existsSync(folderpath)) {
      fs.mkdirSync(folderpath, { recursive: true });
      // console.log(`Created directory: ${folderpath}`);
    }
    return cb(null, folderpath);
  },
  filename: (req, file, cb) => {
    return cb(null, safeFilename(file));
  }
});

exports.bulkupload = multer({
  storage: bulkstorage,
  limits: { files: 60, fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFileFilter,
}).array('files', 60);

exports.eventAlbumImagesUpload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 61, fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFileFilter,
}).fields([
  { name: 'main_image', maxCount: 1 },
  { name: 'gallery_images', maxCount: 60 },
]);

const eventFolderPath = (eventName) =>
  path.join(__dirname, '..', '..', 'storage', 'dmc', 'events', safeEventName(eventName));

const isMainEventImage = (filename = '') => filename.startsWith('main-');

const eventFileLink = (eventName, filename) => `${api_ip}/events/${eventName}/${filename}`;

const writeEventImage = async (folderPath, file, prefix = '') => {
  const filename = `${prefix}${safeFilename(file)}`;
  await fs.promises.writeFile(path.join(folderPath, filename), file.buffer);
  return filename;
};

const removeExistingMainImages = async (folderPath) => {
  const files = await fs.promises.readdir(folderPath).catch(() => []);
  await Promise.all(
    files
      .filter(isMainEventImage)
      .map((filename) => fs.promises.rm(path.join(folderPath, filename), { force: true })),
  );
};

exports.add_event_photos = async (req, res) => {
  const events_details = req.body;
  const files = req.files || [];

  try {
    const eventName = safeEventName(events_details.event_name);
    const folderpath = eventFolderPath(eventName);
    await fs.promises.mkdir(folderpath, { recursive: true });

    const sql = `INSERT INTO event_photos (uploaded_date, event_name, description, added_by, admin_approval, main_page) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [
      events_details.uploaded_date,
      eventName,
      events_details.description,
      events_details.added_by,
      'accepted',
      events_details.main_page
    ];
    
    const [result] = await connection.promise().query(sql, values);

    const filePromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const filePath = path.join(folderpath, file.filename);
        if (path.resolve(file.path) === path.resolve(filePath)) {
          resolve();
          return;
        }
        fs.rename(file.path, filePath, (err) => {
          if (err) reject(err);
          else {
            resolve();
          }
        });
      });
    });

    await Promise.all(filePromises);
    res.json({
      id: result.insertId,
      event_name: eventName,
      message: `${eventName} event album saved successfully`,
    });
  } catch (error) {
    // console.log(error);
    // console.log(error.message);
    console.error('Error in add_event_photos:', error);
    res.status(500).json({ error: 'Failed to upload photos' });
  }
};

const event_photos_links = async (event_name) => {
  const folderpath = path.join(`./storage/dmc/events/${event_name}`);
  try {
    const files = await fs.promises.readdir(folderpath);
    const filesnames = files.filter((file) => {
      const filepath = path.join(folderpath, file);
      const stats = fs.statSync(filepath);
      return stats.isFile();
    });

    const mainImage = filesnames.find(isMainEventImage);
    const galleryFiles = filesnames.filter((filename) => !isMainEventImage(filename));
    const filesOnly = galleryFiles.map((filename) => eventFileLink(event_name, filename));

    return {
      main_image: mainImage ? eventFileLink(event_name, mainImage) : '',
      gallery_images: filesOnly,
      all_images: filesnames.map((filename) => eventFileLink(event_name, filename)),
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const withEventImageLinks = async (eve) => {
  const photos = await event_photos_links(eve.event_name);
  return {
    ...eve,
    main_image: photos.main_image,
    thumbnail: photos.main_image || photos.gallery_images[5] || photos.gallery_images[0] || '',
    event_photos: photos.gallery_images,
    all_event_images: photos.all_images,
  };
};

exports.get_events_photos = async (req, res) => {
  try {
    const sql = "SELECT * FROM event_photos ORDER BY uploaded_date DESC, id DESC";
    connection.query(sql, async (err, result) => {
      if (err) {
        res.status(400).json({ message: err });
      } else {
        const events = [];
        for (const eve of result) {
          try {
            events.push(await withEventImageLinks(eve));
          } catch (error) {
            console.error(`Error fetching photos for event ${eve.event_name}:`, error);
            events.push({ ...eve, main_image: '', thumbnail: '', event_photos: [], all_event_images: [] });
          }
        }
        res.status(200).json({ message: "All Events Photos and their Links", events });
      }
    });
  } catch (error) {
    // console.log(error.message);
    // console.error("Error fetching events:", error);
    res.status(500).json({ error: 'Server is Busy in fetching events' });
  }
};

exports.get_main_events_photos = async (req, res) => {
  try {
    const sql = "SELECT * FROM event_photos WHERE admin_approval='accepted' ORDER BY uploaded_date DESC, id DESC";
    connection.query(sql, async (err, result) => {
      if (err) {
        res.status(400).json({ message: err });
      } else {
        const events = [];
        for (const eve of result) {
          try {
            events.push(await withEventImageLinks(eve));
          } catch (error) {
            console.error(`Error fetching photos for event ${eve.event_name}:`, error);
            events.push({ ...eve, main_image: '', thumbnail: '', event_photos: [], all_event_images: [] });
          }
        }
        res.json({ message: "All Events Photos and their Links", events });
      }
    });
  } catch (error) {
    //console.error("Error fetching events:", error);
    res.status(500).json({ error: 'Server is Busy in fetching events' });
  }
};

exports.delete_event_photos = (req, res) => {
  const eventId = req.params.id;
  const selectSql = `SELECT * FROM event_photos WHERE id = ?`;
  const deleteSql = `DELETE FROM event_photos WHERE id = ?`;

  connection.query(selectSql, [eventId], (selectErr, selectResult) => {
    if (selectErr) {
      // console.error('Error selecting event:', selectErr);
      res.status(500).json({ error: 'Error selecting event' });
      return;
    }

    if (selectResult.length === 0) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const eventName = selectResult[0].event_name;
    const folderPath = path.join('./storage/dmc/events', eventName);

    connection.query(deleteSql, [eventId], (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.error('Error deleting event:', deleteErr);
        res.status(500).json({ error: 'Error deleting event' });
        return;
      }

      fs.rm(folderPath, { recursive: true, force: true }, (rmErr) => {
        if (rmErr) {
         // console.error('Error deleting event folder:', rmErr);
          res.status(500).json({ error: 'Error deleting event folder' });
          return;
        }

        res.json({ message: 'Event deleted successfully', result: deleteResult });
      });
    });
  });
};

exports.update_event_photos = (req, res) => {
  const eventId = req.params.id;
  const {
    uploaded_date,
    event_name,
    description,
    main_page,
    admin_approval,
  } = req.body;

  if (!eventId || !uploaded_date || !event_name) {
    res.status(400).json({ error: 'Event id, date, and event name are required' });
    return;
  }

  let nextEventName;
  try {
    nextEventName = safeEventName(event_name);
  } catch (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  const selectSql = 'SELECT * FROM event_photos WHERE id = ?';
  connection.query(selectSql, [eventId], (selectErr, selectResult) => {
    if (selectErr) {
      res.status(500).json({ error: 'Error selecting event' });
      return;
    }

    if (selectResult.length === 0) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const existingEvent = selectResult[0];
    const currentEventName = existingEvent.event_name;
    const currentFolder = path.join('./storage/dmc/events', currentEventName);
    const nextFolder = path.join('./storage/dmc/events', nextEventName);

    const finishUpdate = () => {
      const updateSql = `
        UPDATE event_photos
        SET uploaded_date = ?, event_name = ?, description = ?, main_page = ?, admin_approval = ?
        WHERE id = ?
      `;
      const values = [
        uploaded_date,
        nextEventName,
        description || '',
        main_page || existingEvent.main_page || 'no',
        admin_approval || existingEvent.admin_approval || 'accepted',
        eventId,
      ];

      connection.query(updateSql, values, (updateErr) => {
        if (updateErr) {
          res.status(500).json({ error: 'Error updating event' });
          return;
        }
        res.json({ message: 'Event album updated successfully' });
      });
    };

    if (currentEventName !== nextEventName && fs.existsSync(currentFolder)) {
      fs.rename(currentFolder, nextFolder, (renameErr) => {
        if (renameErr) {
          res.status(500).json({ error: 'Error renaming event album folder' });
          return;
        }
        finishUpdate();
      });
      return;
    }

    finishUpdate();
  });
};

exports.add_event_album_images = async (req, res) => {
  const eventId = req.params.id;
  const mainImage = req.files?.main_image?.[0];
  const galleryImages = req.files?.gallery_images || [];

  if (!mainImage && !galleryImages.length) {
    res.status(400).json({ error: 'Select a main image or gallery images to upload' });
    return;
  }

  try {
    const [rows] = await connection.promise().query('SELECT * FROM event_photos WHERE id = ?', [eventId]);
    if (!rows.length) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const eventName = safeEventName(rows[0].event_name);
    const folderPath = eventFolderPath(eventName);
    await fs.promises.mkdir(folderPath, { recursive: true });

    if (mainImage) {
      await removeExistingMainImages(folderPath);
      await writeEventImage(folderPath, mainImage, 'main-');
    }

    await Promise.all(galleryImages.map((file) => writeEventImage(folderPath, file)));
    const photos = await event_photos_links(eventName);

    res.json({
      message: 'Event album images updated successfully',
      main_image: photos.main_image,
      event_photos: photos.gallery_images,
      all_event_images: photos.all_images,
    });
  } catch (error) {
    console.error('Error updating event album images:', error);
    res.status(500).json({ error: 'Failed to update event album images' });
  }
};


exports.get_event_photos = async (req, res) => {
  const event_name = req.params.event_name;
  const photos = await event_photos_links(event_name);
  res.json(photos.gallery_images);
};
