const multer = require('multer');
const fs = require('fs');
const path = require('path');
const connection = require('../config');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const QRCode = require('qrcode');
require('dotenv').config();
const api_ip = process.env.domainIp;
const { safeOriginalFilename, notificationFileFilter } = require('../../utils/uploads');
const {
  departments,
  getDepartment,
  getUpdateType,
  inferDepartmentCode,
  normalizeDepartmentCode,
  normalizeUpdateType,
} = require('../../utils/updateDepartments');
fs.mkdirSync('./storage/notifications/', { recursive: true });
const notificationsDir = './storage/notifications/';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, notificationsDir);
  },
  filename: (req, file, cb) => {
    return cb(null, safeOriginalFilename(file, notificationsDir));
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

const toBooleanString = (value) =>
  ['true', 'yes', '1', true, 1].includes(value) ? 'true' : 'false';

const shouldEmbedQr = (value) =>
  ['true', 'yes', '1', 'on', true, 1].includes(value);

const normalizeQrPlacement = (value) =>
  value === 'first_page_corner' ? 'first_page_corner' : 'append_page';

const cleanOptionalDate = (value) => String(value || '').trim() || null;

const getPrefixedTitle = (title, department) => {
  const rawTitle = String(title || '').trim();
  const prefix = department.titlePrefix || department.label || department.code;
  const prefixPattern = new RegExp(`^(${department.code}|${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\s*[-:–—]`, 'i');

  const existingPrefixes = [
    department.code,
    department.label,
    department.titlePrefix,
    department.code === 'CE' ? 'DE' : '',
    department.code === 'DAAP' ? 'DAA&P' : '',
    department.code === 'DRD' ? 'DR&D' : '',
  ]
    .filter(Boolean)
    .map((item) => String(item).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const titlePrefixPattern = new RegExp(`^(${existingPrefixes.join('|')})\\s*[-:–—]`, 'i');

  if (!rawTitle || titlePrefixPattern.test(rawTitle)) return rawTitle;
  return `${prefix} - ${rawTitle}`;
};

const notificationOrderSql = `
  ORDER BY
    COALESCE(NULLIF(revised_date, ''), date) DESC,
    id DESC
`;

const logoPath = path.join(__dirname, '../../assets/jntugv-logo.png');

const drawBrandedQr = async (pdfDoc, page, filename, options = {}) => {
  const qrSize = Number(options.size || 86);
  const x = Number(options.x || 24);
  const y = Number(options.y || 24);
  const qrPng = await QRCode.toBuffer(publicMediaLink(filename), {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 360,
    color: {
      dark: '#210653',
      light: '#FFFFFF',
    },
  });
  const qrImage = await pdfDoc.embedPng(qrPng);

  page.drawImage(qrImage, {
    x,
    y,
    width: qrSize,
    height: qrSize,
  });

  if (!fs.existsSync(logoPath)) return;

  const logoBytes = await fs.promises.readFile(logoPath);
  const logoImage = await pdfDoc.embedPng(logoBytes);
  const badgeSize = qrSize * 0.28;
  const badgeX = x + (qrSize - badgeSize) / 2;
  const badgeY = y + (qrSize - badgeSize) / 2;
  const logoSize = badgeSize * 0.78;

  page.drawRectangle({
    x: badgeX,
    y: badgeY,
    width: badgeSize,
    height: badgeSize,
    color: rgb(1, 1, 1),
  });

  page.drawImage(logoImage, {
    x: x + (qrSize - logoSize) / 2,
    y: y + (qrSize - logoSize) / 2,
    width: logoSize,
    height: logoSize,
  });
};

const appendQrToStoredPdf = async (filename, options = {}) => {
  if (!filename || !filename.toLowerCase().endsWith('.pdf')) return;
  if (!shouldEmbedQr(options.embedQrCode)) return;

  const filePath = `./storage/notifications/${filename}`;
  const pdfBytes = await fs.promises.readFile(filePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const placement = normalizeQrPlacement(options.placement);

  if (placement === 'first_page_corner') {
    const [firstPage] = pdfDoc.getPages();
    if (!firstPage) return;
    const { width } = firstPage.getSize();
    const qrSize = 72;
    await drawBrandedQr(pdfDoc, firstPage, filename, {
      size: qrSize,
      x: width - qrSize - 16,
      y: 16,
    });
  } else {
    const qrPage = pdfDoc.addPage([360, 240]);
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    qrPage.drawText('JNTU-GV Notification Verification', {
      x: 34,
      y: 190,
      size: 13,
      font: titleFont,
      color: rgb(0.13, 0.02, 0.33),
    });
    qrPage.drawText('Scan the QR code to open the official uploaded PDF link.', {
      x: 34,
      y: 170,
      size: 9,
      font: bodyFont,
      color: rgb(0.2, 0.24, 0.32),
    });
    await drawBrandedQr(pdfDoc, qrPage, filename, {
      size: 104,
      x: 128,
      y: 46,
    });
  }

  await fs.promises.writeFile(filePath, await pdfDoc.save());
};

const mapNotificationRows = (results) => results.map(eve => {
  const filelink = publicMediaLink(eve.file_path);
  const department = getDepartment(inferDepartmentCode(eve));
  const updateType = getUpdateType(eve.update_type, department.code);
  const effectiveDate = eve.revised_date || eve.date;
  const displayTitle = getPrefixedTitle(eve.title, department);

  return {
    id: eve.id,
    date: eve.date,
    revised_date: eve.revised_date || '',
    expiry_date: eve.expiry_date || '',
    effective_date: effectiveDate,
    title: eve.title,
    display_title: displayTitle,
    file_path: eve.file_path,
    external_text: eve.external_text,
    external_link: eve.external_link,
    department: department.code,
    department_label: department.label,
    department_name: department.name,
    type_of_update: updateType.code,
    type_of_update_label: updateType.label,
    is_static: toBooleanString(eve.is_static) === 'true',
    submitted_by: eve.submitted_by,
    file_link: filelink,
  };
});

exports.insert_event = async (req, res) => {
  
  const update = req.body;
  const file = req.file ? req.file.filename : '';
  const department = normalizeDepartmentCode(update.department);
  const mainPage = 'yes';
  const scrolling = 'no';
  const updateType = normalizeUpdateType(update.type_of_update || update.update_type, department);
  const isStatic = toBooleanString(update.is_static);
  const expiryDate = cleanOptionalDate(update.expiry_date);
  const revisedDate = cleanOptionalDate(update.revised_date);
  const updateStatus = 'update';

  if (isStatic === 'true' && !expiryDate) {
    res.status(400).json({ error: 'Expiry date is required for static notifications' });
    return;
  }

  try {
    await appendQrToStoredPdf(file, {
      embedQrCode: update.embed_qr_code,
      placement: update.qr_placement,
    });
  } catch (err) {
    if (file) fs.promises.unlink(`./storage/notifications/${file}`).catch(() => {});
    console.error('Error appending QR code to notification PDF:', err);
    res.status(500).json({ error: 'Error adding QR code to PDF' });
    return;
  }

  const sql = 'INSERT INTO notification_updates (date, title, file_path, external_text, external_link, main_page, scrolling, department, update_type, is_static, expiry_date, revised_date, update_status, submitted_by, admin_approval) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [update.date, update.title, file, update.external_txt, update.external_lnk, mainPage, scrolling, department, updateType, isStatic, expiryDate, revisedDate, updateStatus, update.submitted_by, 'accepted'];

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
  const { date, title, external_text, external_link, submitted_by } = req.body;
  const department = normalizeDepartmentCode(req.body.department);
  const updateType = normalizeUpdateType(req.body.type_of_update || req.body.update_type, department);
  const isStatic = toBooleanString(req.body.is_static);
  const expiryDate = cleanOptionalDate(req.body.expiry_date);
  const revisedDate = cleanOptionalDate(req.body.revised_date);
  const updateStatus = 'update';

  if (!updateId || !date || !title) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
  }

  if (isStatic === 'true' && !expiryDate) {
      res.status(400).json({ error: 'Expiry date is required for static notifications' });
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
      let sql = `UPDATE notification_updates SET date = ?, title = ?, external_text = ?, external_link = ?, main_page = 'yes', scrolling = 'no', department = ?, update_type = ?, is_static = ?, expiry_date = ?, revised_date = ?, update_status = ?, submitted_by = ?, admin_approval = 'accepted'`;
      let values = [date, title, external_text, external_link, department, updateType, isStatic, expiryDate, revisedDate, updateStatus, submitted_by];

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
        appendQrToStoredPdf(req.file.filename, {
          embedQrCode: req.body.embed_qr_code,
          placement: req.body.qr_placement,
        })
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

exports.every_events = (req, res) => {
  const { limit, offset } = getPagination(req.query, { limit: 50, maxLimit: 100 });
  const sql = `SELECT * FROM notification_updates ${notificationOrderSql} LIMIT ? OFFSET ?`;

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
  const sql = `SELECT * FROM notification_updates WHERE submitted_by = 'admin' ${notificationOrderSql} LIMIT ? OFFSET ?`;

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
  const sql = `SELECT * FROM notification_updates WHERE submitted_by = ? ${notificationOrderSql}`;

  connection.query(sql, [adminid], (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err}` });
      return;
    }
    res.json(mapNotificationRows(results));
  });
};

exports.get_notifiactions = (req, res) => {
  const sql = `SELECT * FROM notification_updates WHERE update_status = 'update' ${notificationOrderSql}`;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err}` });
      return;
    }
    res.json(mapNotificationRows(results));
  });
};

exports.get_departments = (req, res) => {
  res.json(departments);
};

exports.get_scrolling_notifiactions = (req, res) => {
  const sql = `
    SELECT *
    FROM notification_updates
    WHERE update_status = 'update'
    ORDER BY
      CASE
        WHEN LOWER(title) LIKE '%convocation%' THEN 0
        WHEN LOWER(title) LIKE '%urgent%' THEN 1
        WHEN LOWER(title) LIKE '%important%' THEN 2
        ELSE 3
      END,
      COALESCE(NULLIF(revised_date, ''), date) DESC,
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
