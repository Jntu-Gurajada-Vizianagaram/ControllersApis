require('dotenv').config();
const multer = require('multer');
const connection = require('../config');
const con = require('../config');
const api_ip = process.env.domainIp;
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, './storage/dmc/');
  },
  filename: (req, file, cb) => {
    return cb(null, `${file.originalname}`);
  }
});

exports.dmcUpload = multer({ storage }).single('file');

exports.insert_img = (req, res) => {
  const dmcupload = req.body;
  const file = req.file;
  const int = 0;
  const sql = 'INSERT INTO dmc_upload (id, date, title, file_path, description, submitted, admin_approval, carousel_scrolling, gallery_scrolling) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [int, dmcupload.date, dmcupload.title, file.originalname, dmcupload.description, dmcupload.submitted, dmcupload.admin_approval, dmcupload.carousel_scrolling, dmcupload.gallery_scrolling];

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
  const sel = `SELECT * FROM dmc_upload WHERE id = ${id}`;
  const del = `DELETE FROM dmc_upload WHERE id = ${id}`;
  
  connection.query(sel, (err, result) => {
    if (err) {
      console.error('Error deleting data:', err);
      res.status(500).json({ error: 'Error deleting data' });
      return;
    }
    
    const filepath = `./storage/dmc/${result[0].file_path}`;
    
    connection.query(del, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: 'No Records Found!' });
        return;
      } else {
        fs.access(filepath, fs.constants.F_OK, (err) => {
          if (err) {
            res.json(err);
            console.error('File does not exist');
            return;
          }
          
          fs.unlink(filepath, (err) => {
            if (err) {
              console.error('Error removing file:', err);
              return;
            }
          });
        });
      }
    });

    res.json({ message: 'Data deleted successfully', result });
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

// exports.update_carousel_image = (req, res) => {
//   const img_id = req.params.id;
//   const { dmcupload } = req.body;
//   const sql = `UPDATE dmc_upload SET carousel_scrolling='yes', admin_approval='pending' WHERE id=${img_id}`;
//   connection.query(sql, (err, result) => {
//     if (err) {
//       console.log(err);
//     } else {
//       res.json({ message: `${img_id}`, result: result });
//     }
//   });
// };

exports.carousel_imgs_preview = (req, res) => {
  const sql = "SELECT * FROM dmc_upload WHERE admin_approval='pending' AND carousel_scrolling='yes' ORDER BY id AND admin_approval DESC";

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
  const query1 = `SELECT * FROM dmc_upload WHERE id=${img_id} AND carousel_scrolling='yes'`;
  const query2 = `UPDATE dmc_upload SET carousel_scrolling='no', admin_approval = 'pending' WHERE id=${img_id}`;
  con.query(query1, (err, result1) => {
    if (err) {
      console.log(err);
    } else {
      con.query(query2, (err, result2) => {
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
  const query1 = `SELECT * FROM dmc_upload WHERE id=${img_id} AND carousel_scrolling='no'`;
  const query2 = `UPDATE dmc_upload SET carousel_scrolling='yes', admin_approval = 'pending' WHERE id=${img_id}`;
  con.query(query1, (err, result1) => {
    if (err) {
      console.log(err);
    } else {
      con.query(query2, (err, result2) => {
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
      dmcupload.admin_approval || existingData.admin_approval,
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

exports.webadmin_requests = (req, res) => {
  const sql = "SELECT * FROM dmc_upload WHERE admin_approval='pending' AND carousel_scrolling='yes' ORDER BY id DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err}` });
      return;
    }
    const final_events = results.map(eve => {
      const filelink = `${api_ip}/dmc/${eve.file_path}`;
      const outdate = new Date(eve.date);

      return {
        ...eve,
        file_link: filelink,
        day: outdate.getDate(),
        month: outdate.toLocaleString('en-US', { month: 'short' }),
        year: outdate.getFullYear(),
      };
    });

    res.json(final_events);
  });
};

exports.webadmin_request_accept = (req, res) => {
  const imgid = req.params.id;
  const sql = 'SELECT * FROM dmc_upload WHERE id = ?';
  connection.query(sql, [imgid], (err, result) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error in accepting update: ${err}` });
      return;
    }
    if (result.length > 0) {
      const updateSql = 'UPDATE dmc_upload SET admin_approval = ? WHERE id = ?';
      const updateValues = ['accepted', imgid];
      connection.query(updateSql, updateValues, (uperr, upres) => {
        if (uperr) {
          console.error('Error updating data:', uperr);
          res.status(500).json({ error: `Error in accepting update: ${uperr}` });
          return;
        }
        res.json({ message: 'Image Request Accepted Successfully' });
      });
    } else {
      console.error('No data found');
      res.status(404).json({ error: 'No data found' });
    }
  });
};

exports.webadmin_request_deny = (req, res) => {
  const imgid = req.params.id;
  const sql = `SELECT * FROM dmc_upload WHERE id = ${imgid}`;
  connection.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({ error: `error in accepting update ${err}` });
    } else if (result.length > 0) {
      connection.query(`UPDATE dmc_upload set admin_approval='denied' WHERE id=${imgid}`, (uperr, upres) => {
        if (uperr) {
          res.status(500).json({ error: `error in accepting update ${err}` });
        }
        res.json({ message: "Image request denied Successfully" });
      });
    }
  });
};

exports.webadmin_event_requests = (req, res) => {
  const sql = "SELECT * FROM event_photos WHERE admin_approval='pending' AND main_page='yes' ORDER BY id DESC";

  try {
    con.query(sql, async (err, result) => {
      if (err) {
        res.status(400).json({ message: err });
      } else {
        const events = [];
        for (const eve of result) {
          try {
            const photos = await event_photos_links(eve.event_name);
            events.push({ ...eve, thumbnail: photos[0], event_photos: photos });
          } catch (error) {
            console.error(`Error fetching photos for event ${eve.event_name}:`, error);
            events.push({ ...eve, event_photos: [] });
          }
        }
        res.json(events);
      }
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.webadmin_event_request_accept = (req, res) => {
  const imgid = req.params.id;
  console.log(imgid);
  const sql = `select * from event_photos WHERE id =${imgid}`;
  connection.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: `error in accepting update ${err}` });
    }
    if (result.length > 0) {
      connection.query(`UPDATE event_photos set admin_approval='accepted' WHERE id=${imgid}`, (uperr, upres) => {
        if (uperr) {
          res.status(500).json({ error: `error in accepting update ${err}` });
        }
        res.json({ message: "Event Main Page Request Accepted Successfully" });
      });
    } else {
      res.status(404).json({ error: "Event not found" });
    }
  });
};

exports.webadmin_event_request_deny = (req, res) => {
  const imgid = req.params.id;
  const sql = `select * from event_photos WHERE id =${imgid}`;
  connection.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({ error: `error in accepting update ${err}` });
    } else if (result.length > 0) {
      connection.query(`UPDATE event_photos set admin_approval='denied' WHERE id=${imgid}`, (uperr, upres) => {
        if (uperr) {
          res.status(500).json({ error: `error in accepting update ${err}` });
        }
        res.json({ message: "Event Main Page request denied Successfully" });
      });
    }
  });
};

const bulkstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const event_name = req.body.event_name;
    return cb(null, `./storage/dmc/events/${event_name}`);
  },
  filename: (req, file, cb) => {
    return cb(null, `${file.originalname}`);
  }
});

exports.bulkupload = multer({ storage: bulkstorage }).array('files', 60);

const Create_dir = (event_name) => {
  const dirs = ['./storage/', './storage/dmc/', './storage/dmc/events/', `./storage/dmc/events/${event_name}`];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  return `${event_name} folder is ready, continue to upload images`;
};

exports.add_event_photos = (req, res) => {
  const events_details = req.body;
  const files = req.files;

  try {
    Create_dir(events_details.event_name);
    const sql = `INSERT INTO event_photos (uploaded_date, event_name,folderpath, description, added_by, admin_approval, main_page) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      events_details.uploaded_date,
      events_details.event_name,
      `./storage/dmc/events/${events_details.event_name}`,
      events_details.description,
      events_details.added_by,
      events_details.admin_approval,
      events_details.main_page
    ];
    
    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error inserting event photos:', err);
        return res.status(500).json({ error: 'Error uploading event photos' });
      }

      // Check if files were uploaded
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      // Process uploaded files
      const filePromises = files.map(file => {
        return new Promise((resolve, reject) => {
          const filePath = path.join(folderpath, file.originalname);
          fs.writeFile(filePath, file.buffer, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      });

      Promise.all(filePromises)
        .then(() => {
          res.json({ message: `${events_details.event_name} Photos uploaded Successfully` });
        })
        .catch((error) => {
          console.error('Error saving files:', error);
          res.status(500).json({ error: 'Error saving uploaded files' });
        });
    });
  } catch (error) {
    console.error('Error in add_event_photos:', error);
    res.status(500).json({ error: 'Internal server error' });
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

    const filesOnly = filesnames.map((filename) => {
      const filelink = `${api_ip}/events/${event_name}/${filename}`;
      return filelink;
    });

    return filesOnly;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

exports.get_events_photos = async (req, res) => {
  try {
    const sql = "SELECT * FROM event_photos ORDER BY uploaded_date DESC";
    connection.query(sql, async (err, result) => {
      if (err) {
        res.status(400).json({ message: err });
      } else {
        const events = [];
        for (const eve of result) {
          try {
            const photos = await event_photos_links(eve.event_name);
            events.push({ ...eve, thumbnail: photos[0], event_photos: photos });
          } catch (error) {
            console.error(`Error fetching photos for event ${eve.event_name}:`, error);
            events.push({ ...eve, event_photos: [] });
          }
        }
        res.json({ message: "All Events Photos and their Links", events });
      }
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.get_main_events_photos = async (req, res) => {
  try {
    const sql = "SELECT * FROM event_photos WHERE admin_approval='accepted' ORDER BY uploaded_date DESC";
    connection.query(sql, async (err, result) => {
      if (err) {
        res.status(400).json({ message: err });
      } else {
        const events = [];
        for (const eve of result) {
          try {
            const photos = await event_photos_links(eve.event_name);
            events.push({ ...eve, thumbnail: photos[0], event_photos: photos });
          } catch (error) {
            console.error(`Error fetching photos for event ${eve.event_name}:`, error);
            events.push({ ...eve, event_photos: [] });
          }
        }
        res.json({ message: "All Events Photos and their Links", events });
      }
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.delete_event_photos = (req, res) => {
  const eventId = req.params.id;
  const selectSql = `SELECT * FROM event_photos WHERE id = ?`;
  const deleteSql = `DELETE FROM event_photos WHERE id = ?`;

  connection.query(selectSql, [eventId], (selectErr, selectResult) => {
    if (selectErr) {
      console.error('Error selecting event:', selectErr);
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
          console.error('Error deleting event folder:', rmErr);
          res.status(500).json({ error: 'Error deleting event folder' });
          return;
        }

        res.json({ message: 'Event deleted successfully', result: deleteResult });
      });
    });
  });
};
