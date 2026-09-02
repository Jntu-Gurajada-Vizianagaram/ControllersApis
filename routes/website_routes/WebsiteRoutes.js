const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const connection = require('../../apis/config');
const updates = require('../../apis/updates_api/UpdatesApi');
const pressNotes = require('../../apis/press_notes_api/PressNotesApi');
const { requireRoles } = require('../../middleware/auth');
const { imageFileFilter, safeFilename } = require('../../utils/uploads');

const siteEditor = requireRoles('Admin', 'Developer', 'Updates');
const leadershipEditor = requireRoles('Admin', 'Developer', 'WebAdmin');
const deleteOnly = requireRoles('Admin');
const executiveCouncilImageDir = path.resolve('./storage/executive-council');
const leadershipProfileImageDir = path.resolve('./storage/leadership-profiles');
const peopleImageDir = path.resolve('./storage/people');
fs.mkdirSync(executiveCouncilImageDir, { recursive: true });
fs.mkdirSync(leadershipProfileImageDir, { recursive: true });
fs.mkdirSync(peopleImageDir, { recursive: true });

const executiveCouncilUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, executiveCouncilImageDir),
    filename: (req, file, cb) => cb(null, safeFilename(file)),
  }),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const leadershipProfileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, leadershipProfileImageDir),
    filename: (req, file, cb) => cb(null, safeFilename(file)),
  }),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const peopleUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, peopleImageDir),
    filename: (req, file, cb) => cb(null, safeFilename(file)),
  }),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const approvedNavigation = [
  {
    iconKey: 'home',
    label: 'Home',
    path: '/',
    sort_order: 10,
  },
  {
    iconKey: 'about',
    label: 'About',
    path: '/about-us',
    sort_order: 20,
    subItems: [
      { label: 'About JNTU-GV', path: '/about-us/about-jntugv' },
      { label: 'Vision', path: '/about-us/vision' },
      { label: 'Mission', path: '/about-us/mission' },
      { label: 'University Best Practices', path: '/university/best-practices' },
    ],
  },
  {
    iconKey: 'administration',
    label: 'Administration',
    path: '/administration',
    sort_order: 30,
    subItems: [
      { label: 'Chancellor', path: '/administration/chancellor' },
      { label: 'Vice Chancellor', path: '/administration/vice-chancellor' },
      { label: 'Executive Council', path: '/administration/ec-council' },
      { label: 'Registrar', path: '/administration/registrar' },
      { label: 'Officer on Special Duty (OSD)', path: '/administration/osd' },
    ],
  },
  {
    iconKey: 'academics',
    label: 'Academics',
    path: '/academics',
    sort_order: 40,
    subItems: [
      { label: 'Programs offered', path: '/academics/programs-offered' },
      { label: 'Admissions', path: '/academics/admissions' },
      { label: 'Constituent Colleges', path: '/academics/constituent-colleges' },
      { label: 'Affiliated Colleges', path: '/academics/affliated-colleges' },
      { label: 'Autonomous Colleges', path: '/academics/autonomous-colleges' },
      { label: 'BOS Chairman', path: '/academics/bos-chairman' },
      { label: 'Academic Calendar', path: '/academics/Calendar' },
      { label: 'Academic Syllabus', path: '/academics/academic-syllabus' },
      { label: 'Academic Regulations', path: '/academics/academic-regulations' },
    ],
  },
  {
    iconKey: 'directorates',
    label: 'Directorates',
    path: '/directorates',
    sort_order: 50,
    subItems: [
      { label: 'Academic Audit and Planning', path: '/directorates/academic-audit-planning' },
      { label: 'Admissions', path: '/directorates/admissions' },
      { label: 'Evaluation', path: '/directorates/evaluation' },
      { label: 'Research & Development', path: '/directorates/research' },
      { label: 'Industrial Relations & Placements', path: '/directorates/placements' },
      { label: 'Internal Quality Assurance Cell', path: '/directorates/iqac' },
      { label: 'Alumni Relations', path: '/directorates/alumni-relations' },
    ],
  },
  {
    iconKey: 'examinations',
    label: 'Examinations',
    path: '/examination',
    sort_order: 60,
    subItems: [
      { label: 'Controller of Examinations', path: '/examination/controller' },
      { label: 'Additional Controller of Examinations-SDC', path: '/examination/controller-sdc' },
      { label: 'Additional Controller of Examinations-1', path: '/examination/controller1' },
      { label: 'Additional Controller of Examinations-2', path: '/examination/controller2' },
      { label: 'Additional Controller of Examinations-3', path: '/examination/controller3' },
      { label: 'Additional Controller of Examinations-4', path: '/examination/controller4' },
      { label: 'Additional Controller of Examinations-PG', path: '/examination/controller-pg' },
      { label: 'Examination Results', path: 'https://exams.jntugv.edu.in/results' },
      { label: 'Student Certificates', path: 'https://exams.jntugv.edu.in/student/login' },
    ],
  },
  {
    iconKey: 'certification',
    label: 'Certification',
    path: '/contact-us',
    sort_order: 70,
    subItems: [
      { label: 'PGCPAITL', path: 'https://pgcpaitl.jntugv.edu.in' },
      { label: 'Emerging Technologies', path: 'https://emergingtechnologies.jntugv.edu.in' },
    ],
  },
  {
    iconKey: 'recruitment',
    label: 'Recruitment',
    path: '/recruitment',
    sort_order: 80,
  },
  {
    iconKey: 'convocation',
    label: 'Convocation',
    path: '/1st-convocation',
    sort_order: 85,
  },
  {
    iconKey: 'jobs',
    label: 'Job Opportunities',
    path: 'https://uyopportunities.jntugv.edu.in/',
    sort_order: 90,
  },
  {
    iconKey: 'contact',
    label: 'Contact',
    path: '/contact-us',
    sort_order: 100,
  },
  {
    className: 'quick-links-hidden',
    iconKey: 'quicklinks',
    label: 'Quick Links',
    path: '/quicklinks',
    sort_order: 110,
    subItems: [
      { label: 'Anti-Ragging', path: '/anti-ragging/about' },
      { label: 'Alumni Connect', path: 'https://alumni.jntugv.edu.in' },
      { label: 'University Cells & Committees', path: '/university/cells-and-committees' },
      { label: 'JNTU Act 8 of 2026', path: '/assets/acts/act_8_of_2026.pdf' },
      { label: 'JNTU Act 30 of 2008', path: '/assets/acts/act_30_of_2008.pdf' },
      { label: 'JNTU Act 22 of 2021', path: '/assets/acts/act_22_of_2021.pdf' },
    ],
  },
];

const iconAliases = {
  apartment: 'about',
  business: 'recruitment',
  drafts: 'contact',
  groups: 'administration',
  person: 'directorates',
  school: 'academics',
  description: 'examinations',
  celebration: 'convocation',
  verified: 'certification',
  work: 'jobs',
};

const normalizePath = (path = '') => (path === '/convocation' ? '/1st-convocation' : path || '/');
const normalizeIcon = (iconKey = '', label = '') => {
  const normalizedLabel = String(label || '').toLowerCase();
  if (normalizedLabel.includes('convocation')) return 'convocation';
  if (normalizedLabel.includes('certification')) return 'certification';
  return iconAliases[String(iconKey || '').toLowerCase()] || String(iconKey || 'link').toLowerCase();
};

const normalizeLabelKey = (label = '') =>
  String(label || '')
    .toLowerCase()
    .replace(/1st\s+/, '')
    .replace(/\s+courses$/, '')
    .replace(/\s+us$/, '')
    .trim();

const defaultByLabel = new Map(
  approvedNavigation.map((item) => [normalizeLabelKey(item.label), item]),
);

const toLegacyNavRow = (row) => ({
  id: row.id,
  iconKey: normalizeIcon(row.icon_key || row.iconKey, row.label),
  label: normalizeLabelKey(row.label).includes('convocation') ? 'Convocation' : row.label,
  path: normalizePath(row.path),
  sort_order: normalizeLabelKey(row.label).includes('convocation') ? 85 : Number(row.sort_order || 0),
  is_highlighted: normalizeLabelKey(row.label).includes('convocation') ? false : Boolean(row.is_highlighted),
  className: normalizeLabelKey(row.label) === 'quick links' ? 'quick-links-hidden' : '',
  subItems: [],
});

const navIdentity = (item) => {
  const labelKey = normalizeLabelKey(item.label);
  if (labelKey.includes('convocation') || item.path === '/1st-convocation') return 'convocation';
  return item.path || labelKey;
};

const dedupeNavigation = (items = []) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = navIdentity(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const buildLegacyNavigation = (rows = []) => {
  if (!Array.isArray(rows) || !rows.length) return approvedNavigation;

  const byId = new Map(rows.map((row) => [row.id, toLegacyNavRow(row)]));
  const topLevel = [];

  rows.forEach((row) => {
    const current = byId.get(row.id);
    if (row.parent_id && byId.has(row.parent_id)) {
      byId.get(row.parent_id).subItems.push(current);
    } else {
      topLevel.push(current);
    }
  });

  return dedupeNavigation(
    topLevel.map((item) => {
      const defaultItem = defaultByLabel.get(normalizeLabelKey(item.label));
      return {
        ...item,
        subItems: item.subItems.length
          ? item.subItems.sort((a, b) => a.sort_order - b.sort_order)
          : defaultItem?.subItems,
      };
    }),
  ).sort((a, b) => a.sort_order - b.sort_order);
};

const legacyNavigation = (req, res) => {
  connection.query(
    `SELECT id, label, path, icon_key, parent_id, sort_order, is_highlighted
     FROM site_nav_items
     WHERE is_enabled = TRUE
     ORDER BY COALESCE(parent_id, id), parent_id IS NOT NULL, sort_order, id`,
    (err, rows) => {
      if (err) {
        console.error('Unable to load legacy website navigation:', err.message);
        return res.json(approvedNavigation);
      }

      res.json(buildLegacyNavigation(rows));
    },
  );
};

const normalizeBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
};

const normalizeStatus = (value, fallback = 'active') =>
  ['active', 'inactive'].includes(String(value || '').toLowerCase())
    ? String(value).toLowerCase()
    : fallback;

const normalizeVisibility = (value, fallback = 'public') =>
  ['public', 'private'].includes(String(value || '').toLowerCase())
    ? String(value).toLowerCase()
    : fallback;

const normalizePageKey = (value = '') =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const mapLeadershipProfileRow = (row) => ({
  id: row.id,
  page_key: row.page_key,
  public_url: row.page_key,
  slug: row.page_key,
  name: row.name,
  title: row.title,
  designation: row.title,
  subtitle: row.subtitle,
  email: row.email,
  username: row.email,
  phone: row.phone,
  department: row.department,
  unit: row.unit,
  image: row.image_url,
  photo_url: row.image_url,
  about: row.about,
  sort_order: row.sort_order,
  visibility: row.visibility,
  status: row.status,
});

const leadershipPayload = (body = {}, fallback = {}) => {
  const pageKey = normalizePageKey(body.page_key || body.public_url || fallback.page_key);
  return {
    page_key: pageKey,
    name: String(body.name ?? fallback.name ?? '').trim(),
    title: String(body.title ?? body.designation ?? fallback.title ?? '').trim() || null,
    subtitle: String(body.subtitle ?? fallback.subtitle ?? '').trim() || null,
    email: String(body.email ?? body.username ?? fallback.email ?? '').trim() || null,
    phone: String(body.phone ?? fallback.phone ?? '').trim() || null,
    department: String(body.department ?? fallback.department ?? '').trim() || null,
    unit: String(body.unit ?? fallback.unit ?? '').trim() || null,
    image_url: String(body.image_url ?? body.image ?? fallback.image_url ?? '').trim() || null,
    about: String(body.about ?? fallback.about ?? '').trim() || null,
    sort_order: Number.parseInt(body.sort_order ?? body.sortOrder ?? fallback.sort_order, 10) || 0,
    visibility: normalizeVisibility(body.visibility, fallback.visibility || 'public'),
    status: normalizeStatus(body.status, fallback.status || 'active'),
  };
};

const leadershipImageValueFromRequest = (req, fallback = {}) => {
  if (req.file?.filename) {
    const baseUrl = process.env.domainIp || `${req.protocol}://${req.get('host')}`;
    return `${String(baseUrl).replace(/\/+$/, '')}/leadership-profile-images/${req.file.filename}`;
  }

  return (
    String(req.body?.image_url || req.body?.image || '').trim() ||
    fallback.image_url ||
    null
  );
};

const peopleImageValueFromRequest = (req, fallback = {}) => {
  if (req.file?.filename) {
    const baseUrl = process.env.domainIp || `${req.protocol}://${req.get('host')}`;
    return `${String(baseUrl).replace(/\/+$/, '')}/people-images/${req.file.filename}`;
  }

  return (
    String(req.body?.image_url || req.body?.image || '').trim() ||
    fallback.image_url ||
    null
  );
};

const mapPersonRow = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  department: row.department,
  academic_title: row.academic_title,
  academicTitle: row.academic_title,
  qualifications: row.qualifications,
  image: row.image_url,
  image_url: row.image_url,
  about: row.about,
  sort_order: row.sort_order,
  status: row.status,
});

const personPayload = (body = {}, fallback = {}) => ({
  name: String(body.name ?? fallback.name ?? '').trim(),
  email: String(body.email ?? fallback.email ?? '').trim() || null,
  phone: String(body.phone ?? fallback.phone ?? '').trim() || null,
  department: String(body.department ?? fallback.department ?? '').trim() || null,
  academic_title: String(body.academic_title ?? body.academicTitle ?? fallback.academic_title ?? '').trim() || null,
  qualifications: String(body.qualifications ?? fallback.qualifications ?? '').trim() || null,
  image_url: String(body.image_url ?? body.image ?? fallback.image_url ?? '').trim() || null,
  about: String(body.about ?? fallback.about ?? '').trim() || null,
  sort_order: Number.parseInt(body.sort_order ?? body.sortOrder ?? fallback.sort_order, 10) || 0,
  status: normalizeStatus(body.status, fallback.status || 'active'),
});

const mapAssignmentRow = (row) => ({
  id: row.id,
  person_id: row.person_id,
  personId: row.person_id,
  position_type: row.position_type,
  positionType: row.position_type,
  position_key: row.position_key,
  positionKey: row.position_key,
  page_key: row.position_key,
  public_url: row.position_key,
  position_label: row.position_label,
  positionLabel: row.position_label,
  directorate_name: row.directorate_name,
  directorateName: row.directorate_name,
  title_override: row.title_override,
  titleOverride: row.title_override,
  subtitle_override: row.subtitle_override,
  subtitleOverride: row.subtitle_override,
  email_override: row.email_override,
  emailOverride: row.email_override,
  website_url: row.website_url,
  websiteUrl: row.website_url,
  is_incharge: Boolean(row.is_incharge),
  isIncharge: Boolean(row.is_incharge),
  visibility: row.visibility,
  status: row.status,
  sort_order: row.sort_order,
  person: row.name
    ? {
        id: row.person_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        department: row.department,
        academic_title: row.academic_title,
        qualifications: row.qualifications,
        image: row.image_url,
        image_url: row.image_url,
        about: row.about,
        status: row.person_status,
      }
    : null,
});

const mapAssignedProfileRow = (row) => ({
  id: row.id,
  assignment_id: row.id,
  person_id: row.person_id,
  page_key: row.position_key,
  public_url: row.position_key,
  slug: row.position_key,
  profile_type: row.position_type,
  position_type: row.position_type,
  role: row.position_label,
  position_label: row.position_label,
  name: row.name,
  title: row.title_override || row.position_label || row.academic_title,
  designation: row.title_override || row.position_label || row.academic_title,
  subtitle: row.subtitle_override || row.qualifications || row.academic_title,
  email: row.email_override || row.email,
  username: row.email_override || row.email,
  phone: row.phone,
  department: row.department,
  unit: row.directorate_name || row.position_label,
  directorate_name: row.directorate_name,
  website_url: row.website_url,
  image: row.image_url,
  photo_url: row.image_url,
  about: row.about,
  sort_order: row.sort_order,
  visibility: row.visibility,
  status: row.status,
});

const assignmentPayload = (body = {}, fallback = {}) => {
  const positionType = String(body.position_type ?? body.positionType ?? fallback.position_type ?? 'administration')
    .trim()
    .toLowerCase();
  const positionLabel = String(body.position_label ?? body.positionLabel ?? fallback.position_label ?? '').trim();
  const positionKey = normalizePageKey(
    body.position_key ||
    body.positionKey ||
    body.page_key ||
    body.public_url ||
    fallback.position_key ||
    positionLabel,
  );

  return {
    person_id: Number.parseInt(body.person_id ?? body.personId ?? fallback.person_id, 10),
    position_type: positionType || 'administration',
    position_key: positionKey,
    position_label: positionLabel,
    directorate_name: String(body.directorate_name ?? body.directorateName ?? fallback.directorate_name ?? '').trim() || null,
    title_override: String(body.title_override ?? body.titleOverride ?? body.designation ?? fallback.title_override ?? '').trim() || null,
    subtitle_override: String(body.subtitle_override ?? body.subtitleOverride ?? body.subtitle ?? fallback.subtitle_override ?? '').trim() || null,
    email_override: String(body.email_override ?? body.emailOverride ?? fallback.email_override ?? '').trim() || null,
    website_url: String(body.website_url ?? body.websiteUrl ?? body.personal_website ?? fallback.website_url ?? '').trim() || null,
    is_incharge: ['1', 'true', 1, true].includes(body.is_incharge ?? body.isIncharge ?? fallback.is_incharge),
    visibility: normalizeVisibility(body.visibility, fallback.visibility || 'public'),
    status: normalizeStatus(body.status, fallback.status || 'active'),
    sort_order: Number.parseInt(body.sort_order ?? body.sortOrder ?? fallback.sort_order, 10) || 0,
  };
};

const assignedProfileSql = (onlyActive = true, where = '') => `
  SELECT
    a.id,
    a.person_id,
    a.position_type,
    a.position_key,
    a.position_label,
    a.directorate_name,
    a.title_override,
    a.subtitle_override,
    a.email_override,
    a.website_url,
    a.is_incharge,
    a.visibility,
    a.status,
    a.sort_order,
    p.name,
    p.email,
    p.phone,
    p.department,
    p.academic_title,
    p.qualifications,
    p.image_url,
    p.about,
    p.status AS person_status
  FROM website_position_assignments a
  JOIN website_people p ON p.id = a.person_id
  WHERE a.position_type = 'administration'
    ${onlyActive ? "AND a.visibility = 'public' AND a.status = 'active' AND p.status = 'active'" : ''}
    ${where}
  ORDER BY a.sort_order ASC, a.id ASC`;

const assignedDirectorSql = `
  SELECT
    a.id,
    a.person_id,
    a.position_type,
    a.position_key,
    a.position_label,
    a.directorate_name,
    a.title_override,
    a.subtitle_override,
    a.email_override,
    a.website_url,
    a.is_incharge,
    a.visibility,
    a.status,
    a.sort_order,
    p.name,
    p.email,
    p.phone,
    p.department,
    p.academic_title,
    p.qualifications,
    p.image_url,
    p.about,
    p.status AS person_status
  FROM website_position_assignments a
  JOIN website_people p ON p.id = a.person_id
  WHERE a.position_type = 'directorate'
    AND a.visibility = 'public'
    AND a.status = 'active'
    AND p.status = 'active'
  ORDER BY a.sort_order ASC, a.id ASC`;

const mapAssignedDirectorProfile = (row) => ({
  id: row.id,
  full_name: row.name,
  name: row.name,
  email: row.email_override || row.email,
  academic_position_id: row.title_override || row.position_label || row.academic_title,
  title: row.title_override || row.position_label || row.academic_title,
  department_id: row.department || '',
  department: row.department || '',
  directorate_id: row.directorate_name || row.position_label,
  directorate_name: row.directorate_name || row.position_label,
  personal_website: row.website_url,
  website_url: row.website_url,
  photo_url: row.image_url,
  image: row.image_url,
  about: row.about,
  is_incharge: Boolean(row.is_incharge),
  position_key: row.position_key,
  position_label: row.position_label,
});

const listDirectorateProfiles = (req, res) => {
  connection.query(assignedDirectorSql, (err, rows) => {
    if (err) {
      console.error('Unable to load directorate profiles:', err.message);
      return res.status(500).json({ error: 'Unable to load directorate profiles' });
    }
    if (rows.length) {
      return res.json(rows.map(mapAssignedDirectorProfile));
    }

    const baseUrl = process.env.domainIp || `${req.protocol}://${req.get('host')}`;
    connection.query('SELECT * FROM directors ORDER BY id DESC', (legacyError, legacyRows) => {
      if (legacyError) {
        console.error('Unable to load legacy directorate profiles:', legacyError.message);
        return res.status(500).json({ error: 'Unable to load directorate profiles' });
      }

      res.json((legacyRows || []).map((row) => ({
        ...row,
        name: row.full_name,
        title: row.academic_position_id,
        department: row.department_id,
        directorate_name: row.directorate_id,
        directorate: row.directorate_id,
        website_url: row.personal_website || row.profile_url,
        photo_url: row.photo_path ? `${String(baseUrl).replace(/\/+$/, '')}/director-images/${row.photo_path}` : null,
        image: row.photo_path ? `${String(baseUrl).replace(/\/+$/, '')}/director-images/${row.photo_path}` : null,
      })));
    });
  });
};

const listPeople = (req, res) => {
  connection.query(
    `SELECT id, name, email, phone, department, academic_title, qualifications, image_url, about, sort_order, status
     FROM website_people
     ORDER BY sort_order ASC, name ASC, id ASC`,
    (err, rows) => {
      if (err) {
        console.error('Unable to load website people:', err.message);
        return res.status(500).json({ error: 'Unable to load website people' });
      }
      res.json(rows.map(mapPersonRow));
    },
  );
};

const createPerson = (req, res) => {
  const data = personPayload({
    ...req.body,
    image_url: peopleImageValueFromRequest(req),
  });

  if (!data.name) return res.status(400).json({ error: 'Name is required' });

  connection.query(
    `INSERT INTO website_people
      (name, email, phone, department, academic_title, qualifications, image_url, about, sort_order, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.email,
      data.phone,
      data.department,
      data.academic_title,
      data.qualifications,
      data.image_url,
      data.about,
      data.sort_order,
      data.status,
    ],
    (err, result) => {
      if (err) {
        console.error('Unable to create website person:', err.message);
        return res.status(500).json({ error: 'Unable to create website person' });
      }
      res.status(201).json({ message: 'Website person created', id: result.insertId });
    },
  );
};

const updatePerson = (req, res) => {
  const rowId = Number.parseInt(req.params.id, 10);
  if (!rowId) return res.status(400).json({ error: 'Invalid person id' });

  connection.query('SELECT * FROM website_people WHERE id = ? LIMIT 1', [rowId], (selectError, rows) => {
    if (selectError) {
      console.error('Unable to load website person:', selectError.message);
      return res.status(500).json({ error: 'Unable to load website person' });
    }
    if (!rows.length) return res.status(404).json({ error: 'Website person not found' });

    const data = personPayload(
      {
        ...req.body,
        image_url: peopleImageValueFromRequest(req, rows[0]),
      },
      rows[0],
    );

    if (!data.name) return res.status(400).json({ error: 'Name is required' });

    connection.query(
      `UPDATE website_people
       SET name = ?, email = ?, phone = ?, department = ?, academic_title = ?, qualifications = ?,
           image_url = ?, about = ?, sort_order = ?, status = ?
       WHERE id = ?`,
      [
        data.name,
        data.email,
        data.phone,
        data.department,
        data.academic_title,
        data.qualifications,
        data.image_url,
        data.about,
        data.sort_order,
        data.status,
        rowId,
      ],
      (err, result) => {
        if (err) {
          console.error('Unable to update website person:', err.message);
          return res.status(500).json({ error: 'Unable to update website person' });
        }
        if (!result.affectedRows) return res.status(404).json({ error: 'Website person not found' });
        res.json({ message: 'Website person updated' });
      },
    );
  });
};

const deletePerson = (req, res) => {
  const rowId = Number.parseInt(req.params.id, 10);
  if (!rowId) return res.status(400).json({ error: 'Invalid person id' });

  connection.query('DELETE FROM website_people WHERE id = ?', [rowId], (err, result) => {
    if (err) {
      console.error('Unable to delete website person:', err.message);
      return res.status(500).json({ error: 'Unable to delete website person' });
    }
    if (!result.affectedRows) return res.status(404).json({ error: 'Website person not found' });
    res.json({ message: 'Website person deleted' });
  });
};

const listAssignments = (req, res) => {
  connection.query(
    `SELECT
       a.*,
       p.name,
       p.email,
       p.phone,
       p.department,
       p.academic_title,
       p.qualifications,
       p.image_url,
       p.about,
       p.status AS person_status
     FROM website_position_assignments a
     LEFT JOIN website_people p ON p.id = a.person_id
     ORDER BY a.position_type ASC, a.sort_order ASC, a.id ASC`,
    (err, rows) => {
      if (err) {
        console.error('Unable to load position assignments:', err.message);
        return res.status(500).json({ error: 'Unable to load position assignments' });
      }
      res.json(rows.map(mapAssignmentRow));
    },
  );
};

const createAssignment = (req, res) => {
  const data = assignmentPayload(req.body);
  if (!data.person_id) return res.status(400).json({ error: 'Select a professor/person' });
  if (!data.position_key) return res.status(400).json({ error: 'Position key is required' });
  if (!data.position_label) return res.status(400).json({ error: 'Position label is required' });

  connection.query(
    `INSERT INTO website_position_assignments
      (person_id, position_type, position_key, position_label, directorate_name, title_override,
       subtitle_override, email_override, website_url, is_incharge, visibility, status, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.person_id,
      data.position_type,
      data.position_key,
      data.position_label,
      data.directorate_name,
      data.title_override,
      data.subtitle_override,
      data.email_override,
      data.website_url,
      data.is_incharge,
      data.visibility,
      data.status,
      data.sort_order,
    ],
    (err, result) => {
      if (err) {
        console.error('Unable to create position assignment:', err.message);
        return res.status(500).json({ error: 'Unable to create position assignment' });
      }
      res.status(201).json({ message: 'Position assignment created', id: result.insertId });
    },
  );
};

const updateAssignment = (req, res) => {
  const rowId = Number.parseInt(req.params.id, 10);
  if (!rowId) return res.status(400).json({ error: 'Invalid assignment id' });

  connection.query('SELECT * FROM website_position_assignments WHERE id = ? LIMIT 1', [rowId], (selectError, rows) => {
    if (selectError) {
      console.error('Unable to load position assignment:', selectError.message);
      return res.status(500).json({ error: 'Unable to load position assignment' });
    }
    if (!rows.length) return res.status(404).json({ error: 'Position assignment not found' });

    const data = assignmentPayload(req.body, rows[0]);
    if (!data.person_id) return res.status(400).json({ error: 'Select a professor/person' });
    if (!data.position_key) return res.status(400).json({ error: 'Position key is required' });
    if (!data.position_label) return res.status(400).json({ error: 'Position label is required' });

    connection.query(
      `UPDATE website_position_assignments
       SET person_id = ?, position_type = ?, position_key = ?, position_label = ?, directorate_name = ?,
           title_override = ?, subtitle_override = ?, email_override = ?, website_url = ?, is_incharge = ?,
           visibility = ?, status = ?, sort_order = ?
       WHERE id = ?`,
      [
        data.person_id,
        data.position_type,
        data.position_key,
        data.position_label,
        data.directorate_name,
        data.title_override,
        data.subtitle_override,
        data.email_override,
        data.website_url,
        data.is_incharge,
        data.visibility,
        data.status,
        data.sort_order,
        rowId,
      ],
      (err, result) => {
        if (err) {
          console.error('Unable to update position assignment:', err.message);
          return res.status(500).json({ error: 'Unable to update position assignment' });
        }
        if (!result.affectedRows) return res.status(404).json({ error: 'Position assignment not found' });
        res.json({ message: 'Position assignment updated' });
      },
    );
  });
};

const deleteAssignment = (req, res) => {
  const rowId = Number.parseInt(req.params.id, 10);
  if (!rowId) return res.status(400).json({ error: 'Invalid assignment id' });

  connection.query('DELETE FROM website_position_assignments WHERE id = ?', [rowId], (err, result) => {
    if (err) {
      console.error('Unable to delete position assignment:', err.message);
      return res.status(500).json({ error: 'Unable to delete position assignment' });
    }
    if (!result.affectedRows) return res.status(404).json({ error: 'Position assignment not found' });
    res.json({ message: 'Position assignment deleted' });
  });
};

const listLeadershipProfiles = (onlyActive = true) => (req, res) => {
  connection.query(
    assignedProfileSql(onlyActive),
    (err, rows) => {
      if (err) {
        console.error('Unable to load leadership profiles:', err.message);
        return res.status(500).json({ error: 'Unable to load leadership profiles' });
      }

      if (rows.length) {
        return res.json(rows.map(mapAssignedProfileRow));
      }

      connection.query(
        `SELECT id, page_key, name, title, subtitle, email, phone, department, unit, image_url, about, sort_order, visibility, status
         FROM website_leadership_profiles
         ${onlyActive ? "WHERE visibility = 'public' AND status = 'active'" : ''}
         ORDER BY sort_order ASC, id ASC`,
        (fallbackErr, fallbackRows) => {
          if (fallbackErr) {
            console.error('Unable to load legacy leadership profiles:', fallbackErr.message);
            return res.status(500).json({ error: 'Unable to load leadership profiles' });
          }
          res.json(fallbackRows.map(mapLeadershipProfileRow));
        },
      );
    },
  );
};

const getLeadershipProfile = (req, res) => {
  const pageKey = normalizePageKey(req.params.pageKey);
  connection.query(
    `${assignedProfileSql(true, 'AND a.position_key = ?')} LIMIT 1`,
    [pageKey],
    (err, rows) => {
      if (err) {
        console.error('Unable to load leadership profile:', err.message);
        return res.status(500).json({ error: 'Unable to load leadership profile' });
      }
      if (rows.length) return res.json(mapAssignedProfileRow(rows[0]));

      connection.query(
        `SELECT id, page_key, name, title, subtitle, email, phone, department, unit, image_url, about, sort_order, visibility, status
         FROM website_leadership_profiles
         WHERE page_key = ? AND visibility = 'public' AND status = 'active'
         LIMIT 1`,
        [pageKey],
        (fallbackErr, fallbackRows) => {
          if (fallbackErr) {
            console.error('Unable to load legacy leadership profile:', fallbackErr.message);
            return res.status(500).json({ error: 'Unable to load leadership profile' });
          }
          if (!fallbackRows.length) return res.status(404).json({ error: 'Leadership profile not found' });
          res.json(mapLeadershipProfileRow(fallbackRows[0]));
        },
      );
    },
  );
};

const createLeadershipProfile = (req, res) => {
  const data = leadershipPayload({
    ...req.body,
    image_url: leadershipImageValueFromRequest(req),
  });
  if (!data.page_key) return res.status(400).json({ error: 'Public page key is required' });
  if (!data.name) return res.status(400).json({ error: 'Name is required' });

  connection.query(
    `INSERT INTO website_leadership_profiles
      (page_key, name, title, subtitle, email, phone, department, unit, image_url, about, sort_order, visibility, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.page_key,
      data.name,
      data.title,
      data.subtitle,
      data.email,
      data.phone,
      data.department,
      data.unit,
      data.image_url,
      data.about,
      data.sort_order,
      data.visibility,
      data.status,
    ],
    (err, result) => {
      if (err) {
        console.error('Unable to create leadership profile:', err.message);
        return res.status(500).json({ error: 'Unable to create leadership profile' });
      }
      res.status(201).json({ message: 'Leadership profile created', id: result.insertId });
    },
  );
};

const updateLeadershipProfile = (req, res) => {
  const rowId = Number.parseInt(req.params.id, 10);
  if (!rowId) return res.status(400).json({ error: 'Invalid profile id' });

  connection.query('SELECT * FROM website_leadership_profiles WHERE id = ? LIMIT 1', [rowId], (selectError, rows) => {
    if (selectError) {
      console.error('Unable to load leadership profile:', selectError.message);
      return res.status(500).json({ error: 'Unable to load leadership profile' });
    }
    if (!rows.length) return res.status(404).json({ error: 'Leadership profile not found' });

    const data = leadershipPayload(
      {
        ...req.body,
        image_url: leadershipImageValueFromRequest(req, rows[0]),
      },
      rows[0],
    );
    if (!data.page_key) return res.status(400).json({ error: 'Public page key is required' });
    if (!data.name) return res.status(400).json({ error: 'Name is required' });

    connection.query(
      `UPDATE website_leadership_profiles
       SET page_key = ?, name = ?, title = ?, subtitle = ?, email = ?, phone = ?, department = ?,
           unit = ?, image_url = ?, about = ?, sort_order = ?, visibility = ?, status = ?
       WHERE id = ?`,
      [
        data.page_key,
        data.name,
        data.title,
        data.subtitle,
        data.email,
        data.phone,
        data.department,
        data.unit,
        data.image_url,
        data.about,
        data.sort_order,
        data.visibility,
        data.status,
        rowId,
      ],
      (err, result) => {
        if (err) {
          console.error('Unable to update leadership profile:', err.message);
          return res.status(500).json({ error: 'Unable to update leadership profile' });
        }
        if (!result.affectedRows) return res.status(404).json({ error: 'Leadership profile not found' });
        res.json({ message: 'Leadership profile updated' });
      },
    );
  });
};

const deleteLeadershipProfile = (req, res) => {
  const rowId = Number.parseInt(req.params.id, 10);
  if (!rowId) return res.status(400).json({ error: 'Invalid profile id' });

  connection.query('DELETE FROM website_leadership_profiles WHERE id = ?', [rowId], (err, result) => {
    if (err) {
      console.error('Unable to delete leadership profile:', err.message);
      return res.status(500).json({ error: 'Unable to delete leadership profile' });
    }
    if (!result.affectedRows) return res.status(404).json({ error: 'Leadership profile not found' });
    res.json({ message: 'Leadership profile deleted' });
  });
};

const mapExecutiveCouncilRow = (row) => ({
  id: row.id,
  name: row.name,
  roleInEc: row.role_in_ec,
  designation: row.designation,
  affiliation: row.affiliation,
  image: row.image_url,
  sortOrder: row.sort_order,
  isActive: Boolean(row.is_active),
});

const imageValueFromRequest = (req) => {
  if (req.file?.filename) {
    const baseUrl = process.env.domainIp || `${req.protocol}://${req.get('host')}`;
    return `${String(baseUrl).replace(/\/+$/, '')}/executive-council-images/${req.file.filename}`;
  }

  return String(req.body?.image_url || req.body?.image || '').trim() || null;
};

const listExecutiveCouncil = (onlyActive = true) => (req, res) => {
  connection.query(
    `SELECT id, name, role_in_ec, designation, affiliation, image_url, sort_order, is_active
     FROM executive_council_members
     ${onlyActive ? 'WHERE is_active = TRUE' : ''}
     ORDER BY sort_order ASC, id ASC`,
    (err, rows) => {
      if (err) {
        console.error('Unable to load executive council:', err.message);
        return res.status(500).json({ error: 'Unable to load executive council' });
      }

      res.json(rows.map(mapExecutiveCouncilRow));
    },
  );
};

const createExecutiveCouncilMember = (req, res) => {
  const {
    name,
    role_in_ec,
    roleInEc,
    designation = '',
    affiliation = '',
    image_url,
    image,
    sort_order,
    sortOrder,
    is_active,
    isActive,
  } = req.body || {};

  if (!String(name || '').trim()) return res.status(400).json({ error: 'Name is required' });
  if (!String(designation || '').trim()) return res.status(400).json({ error: 'Designation is required' });
  if (!String(affiliation || '').trim()) return res.status(400).json({ error: 'Affiliation is required' });

  connection.query(
    `INSERT INTO executive_council_members
      (name, role_in_ec, designation, affiliation, image_url, sort_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      String(name).trim(),
      String(role_in_ec || roleInEc || 'Member').trim(),
      String(designation).trim(),
      String(affiliation).trim(),
      imageValueFromRequest(req),
      Number.parseInt(sort_order ?? sortOrder, 10) || 0,
      normalizeBoolean(is_active ?? isActive, true),
    ],
    (err, result) => {
      if (err) {
        console.error('Unable to create executive council member:', err.message);
        return res.status(500).json({ error: 'Unable to create executive council member' });
      }
      res.status(201).json({ message: 'Executive council member created', id: result.insertId });
    },
  );
};

const updateExecutiveCouncilMember = (req, res) => {
  const rowId = Number.parseInt(req.params.id, 10);
  const {
    name,
    role_in_ec,
    roleInEc,
    designation = '',
    affiliation = '',
    image_url,
    image,
    sort_order,
    sortOrder,
    is_active,
    isActive,
  } = req.body || {};

  if (!rowId) return res.status(400).json({ error: 'Invalid executive council member id' });
  if (!String(name || '').trim()) return res.status(400).json({ error: 'Name is required' });
  if (!String(designation || '').trim()) return res.status(400).json({ error: 'Designation is required' });
  if (!String(affiliation || '').trim()) return res.status(400).json({ error: 'Affiliation is required' });

  connection.query(
    `UPDATE executive_council_members
     SET name = ?, role_in_ec = ?, designation = ?, affiliation = ?, image_url = ?, sort_order = ?, is_active = ?
     WHERE id = ?`,
    [
      String(name).trim(),
      String(role_in_ec || roleInEc || 'Member').trim(),
      String(designation).trim(),
      String(affiliation).trim(),
      imageValueFromRequest(req),
      Number.parseInt(sort_order ?? sortOrder, 10) || 0,
      normalizeBoolean(is_active ?? isActive, true),
      rowId,
    ],
    (err, result) => {
      if (err) {
        console.error('Unable to update executive council member:', err.message);
        return res.status(500).json({ error: 'Unable to update executive council member' });
      }
      if (!result.affectedRows) return res.status(404).json({ error: 'Executive council member not found' });
      res.json({ message: 'Executive council member updated' });
    },
  );
};

const deleteExecutiveCouncilMember = (req, res) => {
  const rowId = Number.parseInt(req.params.id, 10);
  if (!rowId) return res.status(400).json({ error: 'Invalid executive council member id' });

  connection.query('DELETE FROM executive_council_members WHERE id = ?', [rowId], (err, result) => {
    if (err) {
      console.error('Unable to delete executive council member:', err.message);
      return res.status(500).json({ error: 'Unable to delete executive council member' });
    }
    if (!result.affectedRows) return res.status(404).json({ error: 'Executive council member not found' });
    res.json({ message: 'Executive council member deleted' });
  });
};

// Legacy public website aliases.
// Canonical routes remain:
// - /api/site/navbar
// - /api/updates/allnotifications
// - /api/press-notes
// These aliases keep already-deployed public frontend bundles working.
router.get('/navigation', legacyNavigation);
router.get('/static-notifications', updates.get_notifiactions);
router.get('/press-notes', pressNotes.public_press_notes);
router.get('/directorate-profiles', listDirectorateProfiles);
router.get('/leadership-profiles', listLeadershipProfiles(true));
router.get('/leadership-profiles/:pageKey', getLeadershipProfile);
router.get('/admin/people', leadershipEditor, listPeople);
router.post('/admin/people', leadershipEditor, peopleUpload.single('imageFile'), createPerson);
router.put('/admin/people/:id', leadershipEditor, peopleUpload.single('imageFile'), updatePerson);
router.delete('/admin/people/:id', deleteOnly, deletePerson);
router.get('/admin/position-assignments', leadershipEditor, listAssignments);
router.post('/admin/position-assignments', leadershipEditor, createAssignment);
router.put('/admin/position-assignments/:id', leadershipEditor, updateAssignment);
router.delete('/admin/position-assignments/:id', deleteOnly, deleteAssignment);
router.get('/admin/leadership-profiles', leadershipEditor, listLeadershipProfiles(false));
router.post('/admin/leadership-profiles', leadershipEditor, leadershipProfileUpload.single('imageFile'), createLeadershipProfile);
router.put('/admin/leadership-profiles/:id', leadershipEditor, leadershipProfileUpload.single('imageFile'), updateLeadershipProfile);
router.delete('/admin/leadership-profiles/:id', deleteOnly, deleteLeadershipProfile);
router.get('/executive-council', listExecutiveCouncil(true));
router.get('/admin/executive-council', siteEditor, listExecutiveCouncil(false));
router.post('/admin/executive-council', siteEditor, executiveCouncilUpload.single('imageFile'), createExecutiveCouncilMember);
router.put('/admin/executive-council/:id', siteEditor, executiveCouncilUpload.single('imageFile'), updateExecutiveCouncilMember);
router.delete('/admin/executive-council/:id', deleteOnly, deleteExecutiveCouncilMember);

module.exports = router;
