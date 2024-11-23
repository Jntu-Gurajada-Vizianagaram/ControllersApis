const multer = require('multer');
const fs = require('fs');
const connection = require('../config');
require('dotenv').config();
const api_ip = process.env.domainIp;
console.log(api_ip);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, './storage/notifications/');
  },
  filename: (req, file, cb) => {
    return cb(null, `${file.originalname}`);
  }
});


exports.Upload = multer({ storage }).single('file');

exports.insert_event = (req, res) => {
  
  const update = req.body;
  const file = req.file ? req.file.originalname : '';
  const int = 0;
    const sql = 'INSERT INTO notification_updates (date, title, file_path, external_text, external_link, main_page, scrolling, update_type, update_status, submitted_by, admin_approval) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [update.date, update.title, file, update.external_txt, update.external_lnk, update.main_page, update.scrolling, update.update_type, update.update_status, update.submitted_by, update.admin_approval];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).json({ error: 'Error inserting data' });
      return;
    }
    res.json({ message: 'Data inserted successfully' });
  });
};

exports.delete_event = (req, res) => {
  const id = req.params.id;
  const sel = `SELECT * FROM notification_updates WHERE id = ?`;
  const del = `DELETE FROM notification_updates WHERE id = ?`;

  connection.query(sel, [id], (err, result) => {
    if (err) {
      //console.error('Error selecting data:', err);
      res.status(500).json({ error: 'Error selecting data' });
      return;
    }

    if (result.length === 0) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const filepath = result[0].file_path ? `./storage/notifications/${result[0].file_path}` : '';

    connection.query(del, [id], (err, result) => {
      if (err) {
        //console.error('Error deleting data:', err);
        res.status(500).json({ error: 'Error deleting data' });
        return;
      }

      if (filepath) {
        fs.access(filepath, fs.constants.F_OK, (err) => {
          if (!err) {
            fs.unlink(filepath, (err) => {
              if (err) {
                console.error('Error removing file:', err);
              }
            });
          }
        });
      }

      res.json({ message: 'Data deleted successfully' });
    });
  });
};

exports.update_event = (req, res) => {
  const updateId = req.params.id;
  const { date, title, external_text, external_link, main_page, scrolling, update_type, update_status, submitted_by, admin_approval } = req.body;

  if (!updateId || !date || !title) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
  }
  const selQuery = `SELECT file_path FROM notification_updates WHERE id = ?`;

  connection.query(selQuery, [updateId], (err, results) => {
      if (err) {
          res.status(500).json({ error: 'Error fetching event' });
          return;
      }
      
      if (results.length === 0) {
          res.status(404).json({ error: 'No event found' });
          return;
      }

      let oldFilePath = results[0].file_path;
      let sql = `UPDATE notification_updates SET date = ?, title = ?, external_text = ?, external_link = ?, main_page = ?, scrolling = ?, update_type = ?, update_status = ?, submitted_by = ?, admin_approval = ?`;
      let values = [date, title, external_text, external_link, main_page, scrolling, update_type, update_status, submitted_by, admin_approval];

      if (req.file) {
          sql += `, file_path = ?`;
          values.push(req.file.filename);
      }

      sql += ` WHERE id = ?`;
      values.push(updateId);
      connection.query(sql, values, (err, result) => {
          if (err) {
              res.status(500).json({ error: 'Error updating event' });
              return;
          }
          if (req.file && oldFilePath && req.file.filename !== oldFilePath) {
              const oldFileFullPath = `./storage/notifications/${oldFilePath}`;
              fs.access(oldFileFullPath, fs.constants.F_OK, (err) => {
                  if (err) {
                      //console.error('Old file does not exist:', oldFileFullPath);
                      return;
                  }

                  fs.unlink(oldFileFullPath, (err) => {
                      if (err) {
                          //console.error('Error deleting old file:', err);
                          res.status(500).json({error:'File Deletion Error Occured..'});
                          return;
                      } else {
                         res.status(200).status({success:"NEW File Uploaded sucessfully"});
                         return;
                      }
                  });
              });
          }

          res.json({ message: 'Event updated successfully' });
      });
  });
};

exports.update_request_accept = (req, res) => {
  const update = req.params.id;

  connection.query(`UPDATE notification_updates set admin_approval = 'accepted' WHERE id = ?`, [update], (err, result) => {
    if (err) {
      res.status(500).json({ error: `Error in accepting update ${err}` });
      return;
    }
    res.json({ message: 'Update Accepted Successfully' });
  });
};

exports.update_request_deny = (req, res) => {
  const update = req.params.id;

  connection.query(`UPDATE notification_updates set admin_approval = 'denied' WHERE id = ?`, [update], (err, result) => {
    if (err) {
      res.status(500).json({ error: `Error in denying update ${err}` });
      return;
    }
    res.json({ message: 'Update Denied Successfully' });
  });
};

exports.every_events = (req, res) => {
  const sql = "SELECT * FROM notification_updates ORDER BY id DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err}` });
      return;
    }
    const final_events = results.map(eve => {
      const filelink = eve.file_path ?  `${api_ip}/media/${eve.file_path}`: '';
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

exports.all_admin_events = (req, res) => {
  const sql = "SELECT * FROM notification_updates WHERE submitted_by = 'admin' ORDER BY id DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err}` });
      return;
    }
    const final_events = results.map(eve => {
      const filelink = eve.file_path ?  `${api_ip}/media/${eve.file_path}`: '';
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

exports.all_updater_events = (req, res) => {
  const adminid = req.params.adminid;
  const sql = `SELECT * FROM notification_updates WHERE submitted_by = ? ORDER BY id DESC`;

  connection.query(sql, [adminid], (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err}` });
      return;
    }
    const final_events = results.map(eve => {
      const filelink = eve.file_path ?  `${api_ip}/media/${eve.file_path}`: '';
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

exports.update_requests = (req, res) => {
  const sql = "SELECT * FROM notification_updates WHERE admin_approval = 'pending' ORDER BY id DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err}` });
      return;
    }
    const final_events = results.map(eve => {
      const filelink = eve.file_path ? `${api_ip}/media/${eve.file_path}`: '';
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

exports.get_notifiactions = (req, res) => {
  const sql = "SELECT * FROM notification_updates WHERE update_status = 'update' AND admin_approval = 'accepted' AND main_page = 'yes' ORDER BY id DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err}` });
      return;
    }
    const final_events = results.map(eve => {
      const filelink = eve.file_path ? `${api_ip}/media/${eve.file_path}`: '';
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

exports.get_scrolling_notifiactions = (req, res) => {
  const sql = "SELECT * FROM notification_updates WHERE update_status = 'update' AND scrolling = 'yes' ORDER BY id DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err}` });
      return;
    }

    res.json(results);
  });
};
