const express = require('express');
const router = express.Router();

const connection = require('../../apis/config');
const updates = require('../../apis/updates_api/UpdatesApi');
const pressNotes = require('../../apis/press_notes_api/PressNotesApi');

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

// Legacy public website aliases.
// Canonical routes remain:
// - /api/site/navbar
// - /api/updates/allnotifications
// - /api/press-notes
// These aliases keep already-deployed public frontend bundles working.
router.get('/navigation', legacyNavigation);
router.get('/static-notifications', updates.get_notifiactions);
router.get('/press-notes', pressNotes.public_press_notes);

module.exports = router;
