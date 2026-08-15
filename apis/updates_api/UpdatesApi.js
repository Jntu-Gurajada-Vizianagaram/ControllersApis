const multer = require('multer');
const fs = require('fs');
const connection = require('../config');
const { PDFDocument } = require('pdf-lib');
const QRCode = require('qrcode');
require('dotenv').config();
const api_ip = process.env.domainIp;
const { safeFilename, notificationFileFilter } = require('../../utils/uploads');
fs.mkdirSync('./storage/notifications/', { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, './storage/notifications/');
  },
  filename: (req, file, cb) => {
    return cb(null, safeFilename(file));
  }
});


exports.Upload = multer({
  storage,
  limits: { files: 1, fileSize: 20 * 1024 * 1024 },
  fileFilter: notificationFileFilter,
}).single('file');

const getPagination = (query = {}, defaults = {}) => {
  const fallbackLimit = Number(defaults.limit || 50);
  const maxLimit = Number(defaults.maxLimit || 100);
  const limit = Math.min(
    Math.max(Number.parseInt(query.limit, 10) || fallbackLimit, 1),
    maxLimit,
  );
  const offset = Math.max(Number.parseInt(query.offset, 10) || 0, 0);
  return { limit, offset };
};

const publicMediaLink = (filename) =>
  filename ? `${api_ip}/media/${encodeURIComponent(filename)}` : '';

const appendQrToStoredPdf = async (filename) => {
  if (!filename || !filename.toLowerCase().endsWith('.pdf')) return;

  const filePath = `./storage/notifications/${filename}`;
  const pdfBytes = await fs.promises.readFile(filePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const [firstPage] = pdfDoc.getPages();
  if (!firstPage) return;

  const qrPng = await QRCode.toBuffer(publicMediaLink(filename), {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 256,
  });
  const qrImage = await pdfDoc.embedPng(qrPng);
  const { width } = firstPage.getSize();
  const qrSize = 75;

  firstPage.drawImage(qrImage, {
    x: width - qrSize - 10,
    y: 10,
    width: qrSize,
    height: qrSize,
  });

  await fs.promises.writeFile(filePath, await pdfDoc.save());
};

const mapNotificationRows = (results) => results.map(eve => {
  const filelink = publicMediaLink(eve.file_path);
  const outdate = new Date(eve.date);

  return {
    ...eve,
    file_link: filelink,
    day: outdate.getDate(),
    month: outdate.toLocaleString('en-US', { month: 'short' }),
    year: outdate.getFullYear(),
  };
});

exports.insert_event = async (req, res) => {
  
  const update = req.body;
  const file = req.file ? req.file.filename : '';
  try {
    await appendQrToStoredPdf(file);
  } catch (err) {
    if (file) fs.promises.unlink(`./storage/notifications/${file}`).catch(() => {});
    console.error('Error appending QR code to notification PDF:', err);
    res.status(500).json({ error: 'Error adding QR code to PDF' });
    return;
  }

  const sql = 'INSERT INTO notification_updates (date, title, file_path, external_text, external_link, main_page, scrolling, update_type, update_status, submitted_by, admin_approval) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [update.date, update.title, file, update.external_txt, update.external_lnk, update.main_page, update.scrolling, update.update_type, update.update_status, update.submitted_by, 'accepted'];

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
      let values = [date, title, external_text, external_link, main_page, scrolling, update_type, update_status, submitted_by, 'accepted'];

      const continueUpdate = () => {
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
              fs.promises.unlink(oldFileFullPath).catch((unlinkErr) => {
                if (unlinkErr.code !== 'ENOENT') {
                  console.error('Error deleting old notification file:', unlinkErr);
                }
              });
          }

          res.json({ message: 'Event updated successfully' });
        });
      };

      if (req.file) {
        appendQrToStoredPdf(req.file.filename)
          .then(continueUpdate)
          .catch((err) => {
            fs.promises.unlink(`./storage/notifications/${req.file.filename}`).catch(() => {});
            console.error('Error appending QR code to notification PDF:', err);
            res.status(500).json({ error: 'Error adding QR code to PDF' });
          });
      } else {
        continueUpdate();
      }
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
  const { limit, offset } = getPagination(req.query, { limit: 50, maxLimit: 100 });
  const sql = "SELECT * FROM notification_updates ORDER BY id DESC LIMIT ? OFFSET ?";

  connection.query(sql, [limit, offset], (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err}` });
      return;
    }
    res.json(mapNotificationRows(results));
  });
};

exports.all_admin_events = (req, res) => {
  const { limit, offset } = getPagination(req.query, { limit: 10, maxLimit: 100 });
  const sql = "SELECT * FROM notification_updates WHERE submitted_by = 'admin' ORDER BY id DESC LIMIT ? OFFSET ?";

  connection.query(sql, [limit, offset], (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err}` });
      return;
    }
    res.json(mapNotificationRows(results));
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
      const filelink = publicMediaLink(eve.file_path);
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
      const filelink = publicMediaLink(eve.file_path);
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
      const filelink = publicMediaLink(eve.file_path);
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
  const sql = `
    SELECT *
    FROM notification_updates
    WHERE update_status = 'update'
      AND scrolling = 'yes'
      AND admin_approval = 'accepted'
    ORDER BY
      CASE
        WHEN LOWER(title) LIKE '%convocation%' THEN 0
        WHEN LOWER(title) LIKE '%urgent%' THEN 1
        WHEN LOWER(title) LIKE '%important%' THEN 2
        ELSE 3
      END,
      id DESC
    LIMIT 30
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err}` });
      return;
    }

    res.json(mapNotificationRows(results));
  });
};
