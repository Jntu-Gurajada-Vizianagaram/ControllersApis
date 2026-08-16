const connection = require('../config');

const toTitleValue = (value = '', fallback = '') =>
  String(value || fallback)
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const normalizeCollegeStatus = (value = '') => {
  const normalized = String(value || 'Affiliated').trim().toLowerCase();
  if (['autonomous', 'autonoumous'].includes(normalized)) return 'Autonomous';
  if (['university', 'promoted', 'promote to university'].includes(normalized)) return 'University';
  return 'Affiliated';
};

const toBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
};

const normalizeCollege = (body = {}) => ({
  college_code: String(body.college_code || body.code || body.CollegeCode || '').trim(),
  logo: String(body.logo || body.college_logo || body.CollegeLogo || '').trim(),
  college_name: String(body.college_name || body.name || body.CollegeName || '').trim(),
  college_address: String(body.college_address || body.address || body.district || body.District || '').trim(),
  district: String(body.district || body.District || body.college_address || '').trim(),
  affiliation_type: toTitleValue(body.affiliation_type || body.affliation_type || body.Type || body.type, 'Temporary'),
  college_type: toTitleValue(body.college_type || body.CollegeType || body.programme, 'Engineering'),
  college_status: normalizeCollegeStatus(body.college_status || body.status || body.CollegeStatus),
  promote_to_university: toBoolean(body.promote_to_university || body.promoteToUniversity),
  academic_year: String(body.academic_year || body.academicYear || '2026-27').trim(),
  autonomous_year: String(body.autonomous_year || body.autonomousYear || body.AutonomousYear || '').trim(),
  principal_name: String(body.principal_name || body.principalName || body.PrincipalName || '').trim(),
  principal_email: String(body.principal_email || body.principalEmail || body.Email || body.email || '').trim(),
  principal_phone: String(body.principal_phone || body.principalPhone || body.Phone || body.phone || '').trim(),
  jnanabhumi_code: String(body.jnanabhumi_code || body.jnanaBhumiCode || body.JnanaBhumiCode || body.jbCode || body.JBCode || '').trim(),
  college_link: String(body.college_link || body.website || body.wURL || body.link || '').trim(),
});

const toResponse = (row) => ({
  ...row,
  code: row.college_code || '',
  college_logo: row.logo || '',
  website: row.college_link || '',
  type: row.affiliation_type || '',
  status: row.college_status || 'Affiliated',
  promoteToUniversity: Boolean(row.promote_to_university),
  academicYear: row.academic_year || '',
  autonomousYear: row.autonomous_year || '',
  principalName: row.principal_name || '',
  principalEmail: row.principal_email || '',
  principalPhone: row.principal_phone || '',
  jnanaBhumiCode: row.jnanabhumi_code || '',
  jbCode: row.jnanabhumi_code || '',
  CollegeCode: row.college_code || '',
  CollegeName: row.college_name || '',
  District: row.district || row.college_address || '',
  CollegeType: row.college_type || '',
  CollegeStatus: row.college_status || 'Affiliated',
  AutonomousYear: row.autonomous_year || '',
  PrincipalName: row.principal_name || '',
  Email: row.principal_email || '',
  Phone: row.principal_phone || '',
  JnanaBhumiCode: row.jnanabhumi_code || '',
  JBCode: row.jnanabhumi_code || '',
  Type: row.affiliation_type || '',
  wURL: row.college_link || '',
});

const validateCollege = (data) => {
  if (!data.college_code || !data.college_name || !data.district) {
    return 'Code, college name, and district are required';
  }
  return null;
};

exports.insert_college = (req, res) => {
  const data = normalizeCollege(req.body.data || req.body);
  const validationError = validateCollege(data);
  if (validationError) return res.status(400).json({ error: validationError });

  const sql = `
    INSERT INTO affiliated_colleges
      (college_code, logo, college_name, college_address, district, affiliation_type,
       college_type, college_status, promote_to_university, academic_year, autonomous_year,
       principal_name, principal_email, principal_phone, jnanabhumi_code, college_link)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    data.college_code,
    data.logo,
    data.college_name,
    data.college_address || data.district,
    data.district,
    data.affiliation_type,
    data.college_type,
    data.college_status,
    data.promote_to_university || data.college_status === 'University',
    data.academic_year,
    data.autonomous_year,
    data.principal_name,
    data.principal_email,
    data.principal_phone,
    data.jnanabhumi_code,
    data.college_link,
  ];

  connection.query(sql, values, (err, result) => {
    if (err) {
      const duplicate = err.code === 'ER_DUP_ENTRY';
      res.status(duplicate ? 409 : 500).json({ error: duplicate ? 'College code already exists' : 'Error inserting data' });
      return;
    }
    res.status(201).json({ message: 'College inserted successfully', id: result.insertId });
  });
};

exports.update_college = (req, res) => {
  const updateId = req.params.id;
  const data = normalizeCollege(req.body.update || req.body);
  const validationError = validateCollege(data);
  if (validationError) return res.status(400).json({ error: validationError });

  const sql = `
    UPDATE affiliated_colleges
    SET college_code = ?, logo = ?, college_name = ?, college_address = ?, district = ?,
        affiliation_type = ?, college_type = ?, college_status = ?, promote_to_university = ?,
        academic_year = ?, autonomous_year = ?, principal_name = ?, principal_email = ?,
        principal_phone = ?, jnanabhumi_code = ?, college_link = ?
    WHERE id = ?
  `;
  const values = [
    data.college_code,
    data.logo,
    data.college_name,
    data.college_address || data.district,
    data.district,
    data.affiliation_type,
    data.college_type,
    data.college_status,
    data.promote_to_university || data.college_status === 'University',
    data.academic_year,
    data.autonomous_year,
    data.principal_name,
    data.principal_email,
    data.principal_phone,
    data.jnanabhumi_code,
    data.college_link,
    updateId,
  ];

  connection.query(sql, values, (err, result) => {
    if (err) {
      const duplicate = err.code === 'ER_DUP_ENTRY';
      res.status(duplicate ? 409 : 500).json({ error: duplicate ? 'College code already exists' : 'Error updating data' });
      return;
    }
    if (!result.affectedRows) return res.status(404).json({ error: 'College not found' });
    res.json({ message: 'College updated successfully' });
  });
};

exports.delete_college = (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM affiliated_colleges WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error deleting data' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'College not found' });
    res.json({ message: 'College deleted successfully' });
  });
};

exports.get_colleges = (req, res) => {
  const type = String(req.query.type || '').trim();
  const status = String(req.query.status || '').trim();
  const academicYear = String(req.query.academic_year || req.query.academicYear || '').trim();
  const publicOnly = ['1', 'true', 'yes'].includes(String(req.query.public || '').toLowerCase());
  const params = [];
  let sql = `
    SELECT *
    FROM affiliated_colleges
  `;
  const filters = [];
  if (type) {
    filters.push('LOWER(college_type) = LOWER(?)');
    params.push(type);
  }
  if (status) {
    filters.push('LOWER(college_status) = LOWER(?)');
    params.push(normalizeCollegeStatus(status));
  }
  if (academicYear) {
    filters.push('academic_year = ?');
    params.push(academicYear);
  }
  if (publicOnly) {
    filters.push("LOWER(college_status) <> 'university'");
  }
  if (filters.length) sql += ` WHERE ${filters.join(' AND ')}`;
  sql += `
    ORDER BY
      academic_year DESC,
      FIELD(college_status, 'Affiliated', 'Autonomous', 'University'),
      FIELD(college_type, 'Engineering', 'Pharmacy', 'Management'),
      college_name ASC
  `;

  connection.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error retrieving data' });
    res.json(results.map(toResponse));
  });
};
