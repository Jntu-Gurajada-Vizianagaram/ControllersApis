const connection = require('../config');
const fs = require('fs');
const path = require('path');

const directorPayload = (req) => ({
  full_name: req.body.full_name,
  email: req.body.email,
  academic_position_id: req.body.academic_position_id,
  department_id: req.body.department_id,
  directorate_id: req.body.directorate_id,
  profile_url: req.body.profile_url || null,
  personal_website: req.body.personal_website || null,
  is_incharge: ['1', 'true', 1, true].includes(req.body.is_incharge),
});

const isValid = (data) => data.full_name && data.email && data.academic_position_id && data.department_id && data.directorate_id;

exports.all = (req, res) => {
  connection.query('SELECT * FROM directors ORDER BY id DESC', (error, rows) => {
    if (error) return res.status(500).json({ error: 'Unable to retrieve directors' });
    const baseUrl = process.env.domainIp || `${req.protocol}://${req.get('host')}`;
    res.json(rows.map(row => ({
      ...row,
      directorate_name: row.directorate_id,
      photo_url: row.photo_path ? `${baseUrl}/director-images/${row.photo_path}` : null,
    })));
  });
};

exports.add = (req, res) => {
  const data = directorPayload(req);
  if (!isValid(data)) return res.status(400).json({ error: 'Required director fields are missing' });
  const sql = `INSERT INTO directors
    (full_name, email, academic_position_id, department_id, directorate_id, profile_url, personal_website, photo_path, is_incharge)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [data.full_name, data.email, data.academic_position_id, data.department_id, data.directorate_id, data.profile_url, data.personal_website, req.file?.filename || null, data.is_incharge];
  connection.query(sql, values, (error, result) => {
    if (error) return res.status(500).json({ error: 'Unable to add director' });
    res.status(201).json({ id: result.insertId, message: 'Director added successfully' });
  });
};

exports.update = (req, res) => {
  const data = directorPayload(req);
  if (!isValid(data)) return res.status(400).json({ error: 'Required director fields are missing' });
  const fields = ['full_name = ?', 'email = ?', 'academic_position_id = ?', 'department_id = ?', 'directorate_id = ?', 'profile_url = ?', 'personal_website = ?', 'is_incharge = ?'];
  const values = [data.full_name, data.email, data.academic_position_id, data.department_id, data.directorate_id, data.profile_url, data.personal_website, data.is_incharge];
  if (req.file) {
    fields.push('photo_path = ?');
    values.push(req.file.filename);
  }
  values.push(req.params.id);
  connection.query(`UPDATE directors SET ${fields.join(', ')} WHERE id = ?`, values, (error, result) => {
    if (error) return res.status(500).json({ error: 'Unable to update director' });
    if (!result.affectedRows) return res.status(404).json({ error: 'Director not found' });
    res.json({ message: 'Director updated successfully' });
  });
};

exports.remove = (req, res) => {
  connection.query('SELECT photo_path FROM directors WHERE id = ?', [req.params.id], (selectError, rows) => {
    if (selectError) return res.status(500).json({ error: 'Unable to delete director' });
    if (!rows.length) return res.status(404).json({ error: 'Director not found' });
    connection.query('DELETE FROM directors WHERE id = ?', [req.params.id], (deleteError) => {
      if (deleteError) return res.status(500).json({ error: 'Unable to delete director' });
      if (rows[0].photo_path) {
        fs.unlink(path.resolve('./storage/directors', rows[0].photo_path), () => {});
      }
      res.json({ message: 'Director deleted successfully' });
    });
  });
};
