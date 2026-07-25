const fs = require('fs');
const path = require('path');
const multer = require('multer');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const connection = require('../config');
const { pressNoteFileFilter, safeFilename } = require('../../utils/uploads');

require('dotenv').config();

const apiIp = process.env.domainIp;
const baseDir = path.join(__dirname, '..', '..', 'storage', 'press_notes');
const imageDir = path.join(baseDir, 'images');
const docDir = path.join(baseDir, 'documents');

fs.mkdirSync(imageDir, { recursive: true });
fs.mkdirSync(docDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'image') return cb(null, imageDir);
    return cb(null, docDir);
  },
  filename: (req, file, cb) => cb(null, safeFilename(file)),
});

exports.upload = multer({
  storage,
  limits: { files: 2, fileSize: 25 * 1024 * 1024 },
  fileFilter: pressNoteFileFilter,
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'source_file', maxCount: 1 },
]);

const normalizeBoolean = (value, fallback = true) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
};

const getFile = (req, field) => req.files?.[field]?.[0] || null;

const removeFile = (filePath) => {
  if (!filePath) return;
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') console.error('Unable to remove press note file:', err.message);
  });
};

const extractText = async (file) => {
  if (!file) return '';
  if (file.mimetype === 'application/pdf') {
    const data = await pdfParse(await fs.promises.readFile(file.path));
    return String(data.text || '').trim();
  }
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ path: file.path });
    return String(result.value || '').trim();
  }
  return '';
};

const mapRow = (row) => ({
  id: row.id,
  release_date: row.release_date,
  release_time: row.release_time,
  title: row.title,
  body_text: row.body_text,
  extracted_text: row.extracted_text,
  added_by: row.added_by,
  is_published: Boolean(row.is_published),
  image_link: row.image_path ? `${apiIp}/press-notes/images/${row.image_path}` : '',
  source_file_link: row.source_file_path ? `${apiIp}/press-notes/documents/${row.source_file_path}` : '',
  source_file_type: row.source_file_type,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

exports.public_press_notes = (req, res) => {
  connection.query(
    `SELECT * FROM press_notes
     WHERE is_published = TRUE
     ORDER BY release_date DESC, release_time DESC, id DESC`,
    (err, rows) => {
      if (err) {
        console.error('Unable to load press notes:', err.message);
        return res.status(500).json({ error: 'Unable to load press notes' });
      }
      res.json(rows.map(mapRow));
    },
  );
};

exports.admin_press_notes = (req, res) => {
  connection.query(
    `SELECT * FROM press_notes ORDER BY release_date DESC, release_time DESC, id DESC`,
    (err, rows) => {
      if (err) {
        console.error('Unable to load admin press notes:', err.message);
        return res.status(500).json({ error: 'Unable to load press notes' });
      }
      res.json(rows.map(mapRow));
    },
  );
};

exports.create_press_note = async (req, res) => {
  try {
    const image = getFile(req, 'image');
    const sourceFile = getFile(req, 'source_file');
    const extractedText = await extractText(sourceFile);
    const pastedText = String(req.body.body_text || '').trim();
    const bodyText = pastedText || extractedText;

    if (!req.body.release_date || !req.body.release_time || !String(req.body.title || '').trim()) {
      return res.status(400).json({ error: 'Release date, release time, and title are required' });
    }
    if (!image) return res.status(400).json({ error: 'One press note image is required' });
    if (!bodyText) return res.status(400).json({ error: 'Press note text is required. Paste text or upload a supported Word/PDF file.' });

    connection.query(
      `INSERT INTO press_notes
       (release_date, release_time, title, image_path, source_file_path, source_file_type, extracted_text, body_text, added_by, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.body.release_date,
        req.body.release_time,
        String(req.body.title).trim(),
        image.filename,
        sourceFile?.filename || null,
        sourceFile?.mimetype || null,
        extractedText,
        bodyText,
        req.session?.user?.email || req.session?.user?.name || req.body.added_by || null,
        normalizeBoolean(req.body.is_published, true),
      ],
      (err, result) => {
        if (err) {
          console.error('Unable to create press note:', err.message);
          return res.status(500).json({ error: 'Unable to create press note' });
        }
        res.status(201).json({ message: 'Press note created', id: result.insertId, extracted_text: extractedText });
      },
    );
  } catch (error) {
    console.error('Unable to process press note:', error.message);
    res.status(500).json({ error: 'Unable to extract text from uploaded document' });
  }
};

exports.extract_press_note_text = async (req, res) => {
  try {
    const sourceFile = getFile(req, 'source_file');
    if (!sourceFile) return res.status(400).json({ error: 'A Word or PDF file is required' });

    const extractedText = await extractText(sourceFile);
    removeFile(sourceFile.path);

    res.json({ extracted_text: extractedText });
  } catch (error) {
    console.error('Unable to extract press note text:', error.message);
    res.status(500).json({ error: 'Unable to extract text from uploaded document' });
  }
};

exports.update_press_note = async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid press note id' });

  connection.query('SELECT * FROM press_notes WHERE id = ?', [id], async (selectErr, rows) => {
    if (selectErr) return res.status(500).json({ error: 'Unable to load press note' });
    if (!rows.length) return res.status(404).json({ error: 'Press note not found' });

    try {
      const existing = rows[0];
      const image = getFile(req, 'image');
      const sourceFile = getFile(req, 'source_file');
      const extractedText = sourceFile ? await extractText(sourceFile) : existing.extracted_text;
      const pastedText = String(req.body.body_text || '').trim();
      const bodyText = pastedText || extractedText || existing.body_text;

      connection.query(
        `UPDATE press_notes
         SET release_date = ?, release_time = ?, title = ?, image_path = ?, source_file_path = ?,
             source_file_type = ?, extracted_text = ?, body_text = ?, is_published = ?
         WHERE id = ?`,
        [
          req.body.release_date || existing.release_date,
          req.body.release_time || existing.release_time,
          String(req.body.title || existing.title).trim(),
          image?.filename || existing.image_path,
          sourceFile?.filename || existing.source_file_path,
          sourceFile?.mimetype || existing.source_file_type,
          extractedText,
          bodyText,
          normalizeBoolean(req.body.is_published, Boolean(existing.is_published)),
          id,
        ],
        (err) => {
          if (err) {
            console.error('Unable to update press note:', err.message);
            return res.status(500).json({ error: 'Unable to update press note' });
          }
          if (image && existing.image_path !== image.filename) removeFile(path.join(imageDir, existing.image_path));
          if (sourceFile && existing.source_file_path !== sourceFile.filename) removeFile(path.join(docDir, existing.source_file_path));
          res.json({ message: 'Press note updated', extracted_text: extractedText });
        },
      );
    } catch (error) {
      console.error('Unable to update press note:', error.message);
      res.status(500).json({ error: 'Unable to extract text from uploaded document' });
    }
  });
};

exports.delete_press_note = (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid press note id' });

  connection.query('SELECT * FROM press_notes WHERE id = ?', [id], (selectErr, rows) => {
    if (selectErr) return res.status(500).json({ error: 'Unable to load press note' });
    if (!rows.length) return res.status(404).json({ error: 'Press note not found' });

    connection.query('DELETE FROM press_notes WHERE id = ?', [id], (deleteErr) => {
      if (deleteErr) return res.status(500).json({ error: 'Unable to delete press note' });
      removeFile(path.join(imageDir, rows[0].image_path));
      removeFile(path.join(docDir, rows[0].source_file_path));
      res.json({ message: 'Press note deleted' });
    });
  });
};
