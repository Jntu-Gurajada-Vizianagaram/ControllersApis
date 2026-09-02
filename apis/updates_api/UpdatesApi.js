const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const crypto = require('crypto');
const connection = require('../config');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const QRCode = require('qrcode');
require('dotenv').config();
const api_ip = process.env.domainIp;
const { safeOriginalFilename } = require('../../utils/uploads');
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

const notificationFileExtensions = new Map([
  ['application/pdf', '.pdf'],
  ['application/zip', '.zip'],
  ['application/x-zip-compressed', '.zip'],
  ['multipart/x-zip', '.zip'],
]);

const getNotificationExtension = (file = {}) => {
  const originalExtension = path.extname(file.originalname || '').toLowerCase();
  if (originalExtension === '.pdf' || originalExtension === '.zip') {
    return originalExtension;
  }
  return notificationFileExtensions.get(file.mimetype) || '';
};

const sanitizeNotificationFilename = (file, directory) => {
  const extension = getNotificationExtension(file);
  if (!extension) throw new Error('Only PDF and ZIP files are allowed for notifications');

  if (extension === '.pdf') {
    return safeOriginalFilename(file, directory);
  }

  const parsed = path.parse(file.originalname || `notification-${Date.now()}${extension}`);
  const baseName = parsed.name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);

  const safeBaseName = baseName || `notification-${Date.now()}`;
  let candidate = `${safeBaseName}${extension}`;
  let copy = 2;

  while (directory && fs.existsSync(path.join(directory, candidate))) {
    candidate = `${safeBaseName}-${copy}${extension}`;
    copy += 1;
  }

  return candidate;
};

const notificationUploadFileFilter = (req, file, callback) => {
  const extension = getNotificationExtension(file);
  const allowedMime =
    file.mimetype === 'application/pdf' ||
    notificationFileExtensions.has(file.mimetype) ||
    (file.mimetype === 'application/octet-stream' && extension === '.zip');

const allowed = Boolean(extension) && allowedMime;
  callback(allowed ? null : new Error('Only PDF and ZIP files are allowed for notifications'), allowed);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, notificationsDir);
  },
  filename: (req, file, cb) => {
    return cb(null, sanitizeNotificationFilename(file, notificationsDir));
  }
});


exports.Upload = multer({
  storage,
  limits: { files: 1, fileSize: 75 * 1024 * 1024 },
  fileFilter: notificationUploadFileFilter,
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

const cleanExternalLink = (value) => {
  const link = String(value || '').trim();
  if (!link) return '';

  try {
    const url = new URL(link);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};

const getQrDestinationLink = (filename, externalLink) =>
  cleanExternalLink(externalLink) || publicMediaLink(filename);

const getNotificationSigningSecret = () =>
  process.env.NOTIFICATION_SIGNING_SECRET
  || process.env.SESSION_SECRET
  || process.env.GOOGLE_CLIENT_SECRET
  || 'jntugv-development-signing-secret';

const createNotificationSignature = ({ filename, destinationLink, pdfBytes }) => {
  const fileHash = crypto.createHash('sha256').update(pdfBytes).digest('hex');
  const signature = crypto
    .createHmac('sha256', getNotificationSigningSecret())
    .update(`${filename}|${destinationLink}|${fileHash}`)
    .digest('hex');

  return {
    fileHash,
    signature,
    token: `JNTUGV-${signature.slice(0, 16).toUpperCase()}`,
  };
};

const writeNotificationSignatureSidecar = async ({ filePath, filename, token, destinationLink, signedPdfBytes }) => {
  const finalFileHash = crypto.createHash('sha256').update(signedPdfBytes).digest('hex');
  const finalSignature = crypto
    .createHmac('sha256', getNotificationSigningSecret())
    .update(`${token}|${filename}|${destinationLink}|${finalFileHash}`)
    .digest('hex');

  await fs.promises.writeFile(
    `${filePath}.signature.json`,
    JSON.stringify({
      issuer: 'JNTU-GV Controllers API',
      token,
      filename,
      destination_link: destinationLink,
      pdf_sha256: finalFileHash,
      signature: finalSignature,
      algorithm: 'HMAC-SHA256',
      signed_at: new Date().toISOString(),
    }, null, 2),
  );
};

const removeNotificationSignatureSidecar = (filePath) => {
  if (!filePath) return;
  fs.promises.unlink(`${filePath}.signature.json`).catch((error) => {
    if (error.code !== 'ENOENT') {
      console.error('Error deleting notification signature file:', error);
    }
  });
};

const persistSignedNotificationPdf = async ({
  pdfDoc,
  filePath,
  filename,
  token,
  destinationLink,
  fallbackPdfBytes,
}) => {
  try {
    const signedPdfBytes = await pdfDoc.save();
    await fs.promises.writeFile(filePath, signedPdfBytes);
    await writeNotificationSignatureSidecar({
      filePath,
      filename,
      token,
      destinationLink,
      signedPdfBytes,
    });
    return true;
  } catch (error) {
    console.warn(`Unable to write QR/signature into ${filename}; keeping original PDF:`, error.message);
    await writeNotificationSignatureSidecar({
      filePath,
      filename,
      token,
      destinationLink,
      signedPdfBytes: fallbackPdfBytes,
    });
    return false;
  }
};

const toBooleanString = (value) =>
  ['true', 'yes', '1', true, 1].includes(value) ? 'true' : 'false';

const shouldEmbedQr = (value) => {
  if (value === undefined || value === null || value === '') return true;
  return ['true', 'yes', '1', 'on', true, 1].includes(value);
};

const normalizeQrPlacement = (value) =>
  value === 'append_page' ? 'append_page' : 'first_page_corner';

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
let pdfjsPromise;

const loadPdfJs = async () => {
  if (!pdfjsPromise) {
    const pdfjsPath = require.resolve('pdfjs-dist/legacy/build/pdf.mjs');
    pdfjsPromise = import(pathToFileURL(pdfjsPath).href);
  }
  return pdfjsPromise;
};

const getPdfJsStandardFontDataUrl = () => {
  const pdfjsPackagePath = require.resolve('pdfjs-dist/package.json');
  const standardFontsPath = path.join(path.dirname(pdfjsPackagePath), 'standard_fonts');
  return `${standardFontsPath}${path.sep}`;
};

const rectanglesOverlap = (a, b) =>
  a.x < b.x + b.width
  && a.x + a.width > b.x
  && a.y < b.y + b.height
  && a.y + a.height > b.y;

const hasTextInQrPlacement = async (pdfBytes, placement, pageNumber = 1) => {
  let pdfDoc;

  try {
    const pdfjs = await loadPdfJs();
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(pdfBytes),
      disableFontFace: true,
      disableWorker: true,
      isEvalSupported: false,
      standardFontDataUrl: getPdfJsStandardFontDataUrl(),
      stopAtErrors: false,
    });

    pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent({ disableNormalization: false });
    const padding = 8;
    const target = {
      x: placement.x - padding,
      y: viewport.height - placement.y - placement.height - padding,
      width: placement.width + padding * 2,
      height: placement.height + padding * 2,
    };

    for (const item of textContent.items || []) {
      if (!item.str || !String(item.str).trim() || !Array.isArray(item.transform)) continue;

      const [x, y] = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
      const height = Math.max(Math.abs(item.height || item.transform[3] || 0), 6);
      const width = Math.max(Math.abs(item.width || 0), String(item.str).length * height * 0.35);
      const textBox = {
        x,
        y: y - height,
        width,
        height,
      };

      if (rectanglesOverlap(target, textBox)) {
        page.cleanup();
        return true;
      }
    }

    page.cleanup();
    return false;
  } catch (err) {
    console.warn(`Unable to inspect page ${pageNumber} QR placement for text; trying another safe placement:`, err.message);
    return true;
  } finally {
    if (pdfDoc) {
      const destroyResult = pdfDoc.destroy();
      if (destroyResult && typeof destroyResult.catch === 'function') {
        destroyResult.catch(() => {});
      }
    }
  }
};

const drawSignatureToken = async (pdfDoc, page, token, options = {}) => {
  if (!token) return;

  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  page.drawText(`Verified Token: ${token}`, {
    x: Number(options.x || 24),
    y: Number(options.y || 8),
    size: Number(options.size || 5.5),
    font: bodyFont,
    color: rgb(0.28, 0.31, 0.36),
  });
};

const drawBrandedQr = async (pdfDoc, page, destinationLink, options = {}) => {
  const qrSize = Number(options.size || 86);
  const x = Number(options.x || 24);
  const y = Number(options.y || 24);
  const qrPng = await QRCode.toBuffer(destinationLink, {
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
  const logoSize = qrSize * 0.3;

  page.drawImage(logoImage, {
    x: x + (qrSize - logoSize) / 2,
    y: y + (qrSize - logoSize) / 2,
    width: logoSize,
    height: logoSize,
  });
};

const drawVerificationPage = async (pdfDoc, destinationLink, token) => {
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
  qrPage.drawText('Scan the QR code to open the linked notification resource.', {
    x: 34,
    y: 170,
    size: 9,
    font: bodyFont,
    color: rgb(0.2, 0.24, 0.32),
  });
  await drawBrandedQr(pdfDoc, qrPage, destinationLink, {
    size: 104,
    x: 128,
    y: 46,
  });
  await drawSignatureToken(pdfDoc, qrPage, token, {
    x: 34,
    y: 28,
    size: 7,
  });
};

const appendQrToStoredPdf = async (filename, options = {}) => {
  if (!filename || !filename.toLowerCase().endsWith('.pdf')) return;
  if (!shouldEmbedQr(options.embedQrCode)) return;

  const filePath = `./storage/notifications/${filename}`;
  const pdfBytes = await fs.promises.readFile(filePath);
  const placement = normalizeQrPlacement(options.placement);
  const destinationLink = getQrDestinationLink(filename, options.externalLink);
  const signature = createNotificationSignature({ filename, destinationLink, pdfBytes });
  let pdfDoc;

  try {
    pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  } catch (error) {
    console.warn(`Unable to open ${filename} for QR/signature; keeping original PDF:`, error.message);
    await writeNotificationSignatureSidecar({
      filePath,
      filename,
      token: signature.token,
      destinationLink,
      signedPdfBytes: pdfBytes,
    });
    return;
  }

  pdfDoc.setCreator('JNTU-GV Notification Console');
  pdfDoc.setProducer('JNTU-GV Controllers API');
  pdfDoc.setSubject(`JNTU-GV tamper-evident token: ${signature.token}`);
  pdfDoc.setKeywords([
    'JNTU-GV',
    'notification',
    'tamper-evident',
    signature.token,
    `sha256:${signature.fileHash}`,
  ]);

  if (placement === 'first_page_corner') {
    const pages = pdfDoc.getPages();
    const qrSize = 82;
    let qrPlaced = false;
    const pagesToCheck = pages.slice(0, 2);

    for (let index = 0; index < pagesToCheck.length; index += 1) {
      const page = pagesToCheck[index];
      const { width } = page.getSize();
      const qrPlacement = {
        width: qrSize,
        height: qrSize,
        x: width - qrSize - 18,
        y: 18,
      };

      if (await hasTextInQrPlacement(pdfBytes, qrPlacement, index + 1)) {
        console.info(`QR placement skipped for ${filename}: page ${index + 1} bottom-right area already contains text.`);
        continue;
      }

      await drawBrandedQr(pdfDoc, page, destinationLink, {
        size: qrSize,
        x: qrPlacement.x,
        y: qrPlacement.y,
      });
      await drawSignatureToken(pdfDoc, page, signature.token, {
        x: Math.max(18, qrPlacement.x - 104),
        y: qrPlacement.y,
      });
      console.info(`QR embedded for ${filename} on page ${index + 1}.`);
      qrPlaced = true;
      break;
    }

    if (!qrPlaced) {
      console.info(`QR embedding skipped for ${filename}: no clear bottom-right area found on page 1 or page 2.`);
    }
  } else {
    await drawVerificationPage(pdfDoc, destinationLink, signature.token);
  }

  await persistSignedNotificationPdf({
    pdfDoc,
    filePath,
    filename,
    token: signature.token,
    destinationLink,
    fallbackPdfBytes: pdfBytes,
  });
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
      externalLink: update.external_lnk,
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
            removeNotificationSignatureSidecar(filepath);
          }
        });
      }

      res.json({ message: 'Data deleted successfully' });
    });
  });
};

exports.update_event = (req, res) => {
  const updateId = req.params.id;
  const department = normalizeDepartmentCode(req.body.department);
  const updateType = normalizeUpdateType(req.body.type_of_update || req.body.update_type, department);
  const isStatic = toBooleanString(req.body.is_static);
  const updateStatus = 'update';

  if (!updateId) {
      res.status(400).json({ error: 'Notification id is required' });
      return;
  }

  const selQuery = `SELECT file_path, date, title, external_text, external_link, expiry_date, revised_date, submitted_by FROM notification_updates WHERE id = ?`;

  connection.query(selQuery, [updateId], (err, results) => {
      if (err) {
          res.status(500).json({ error: 'Error fetching event' });
          return;
      }
      
      if (results.length === 0) {
          res.status(404).json({ error: 'No event found' });
          return;
      }

      const existing = results[0];
      const nextDate = String(req.body.date || existing.date || '').trim();
      const nextTitle = String(req.body.title || existing.title || '').trim();
      const nextExternalText = req.body.external_text !== undefined ? req.body.external_text : existing.external_text;
      const nextExternalLink = req.body.external_link !== undefined ? req.body.external_link : existing.external_link;
      const nextSubmittedBy = req.body.submitted_by || existing.submitted_by || 'admin';
      const expiryDate = isStatic === 'true'
        ? cleanOptionalDate(req.body.expiry_date) || cleanOptionalDate(existing.expiry_date)
        : null;
      const revisedDate = cleanOptionalDate(req.body.revised_date) || null;

      if (!nextDate || !nextTitle) {
          res.status(400).json({ error: 'Notification date and title are required' });
          return;
      }

      if (isStatic === 'true' && !expiryDate) {
          res.status(400).json({ error: 'Expiry date is required for static notifications' });
          return;
      }

      let oldFilePath = existing.file_path;
      let sql = `UPDATE notification_updates SET date = ?, title = ?, external_text = ?, external_link = ?, main_page = 'yes', scrolling = 'no', department = ?, update_type = ?, is_static = ?, expiry_date = ?, revised_date = ?, update_status = ?, submitted_by = ?, admin_approval = 'accepted'`;
      let values = [nextDate, nextTitle, nextExternalText, nextExternalLink, department, updateType, isStatic, expiryDate, revisedDate, updateStatus, nextSubmittedBy];

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
              removeNotificationSignatureSidecar(oldFileFullPath);
          }

          res.json({ message: 'Event updated successfully' });
        });
      };

      if (req.file) {
        appendQrToStoredPdf(req.file.filename, {
          embedQrCode: req.body.embed_qr_code,
          placement: req.body.qr_placement,
          externalLink: req.body.external_link,
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
