const con = require('../apis/config');

const defaultNavItems = [
  { label: 'Home', path: '/', reference_key: 'nav.home', cms_section: 'static_page', icon_key: 'home', sort_order: 10, is_highlighted: false },
  { label: 'About', path: '/about-us', reference_key: 'nav.about', cms_section: 'static_page', icon_key: 'apartment', sort_order: 20, is_highlighted: false },
  { label: 'Administration', path: '/administration', reference_key: 'nav.administration', cms_section: 'directors', icon_key: 'groups', sort_order: 30, is_highlighted: false },
  { label: 'Academics', path: '/academics', reference_key: 'nav.academics', cms_section: 'notification_console', icon_key: 'school', sort_order: 40, is_highlighted: false },
  { label: 'Directorates', path: '/directorates', reference_key: 'nav.directorates', cms_section: 'professionals', icon_key: 'person', sort_order: 50, is_highlighted: false },
  { label: 'Examinations', path: '/examination', reference_key: 'nav.examinations', cms_section: 'notification_console', icon_key: 'description', sort_order: 60, is_highlighted: false },
  { label: 'Certification', path: '/certification', reference_key: 'nav.certification', cms_section: 'dropdown', icon_key: 'verified', sort_order: 70, is_highlighted: false },
  { label: 'Recruitment', path: '/recruitment', reference_key: 'nav.recruitment', cms_section: 'notification_console', icon_key: 'business', sort_order: 80, is_highlighted: false },
  { label: 'Convocation', path: '/1st-convocation', reference_key: 'nav.convocation', cms_section: 'static_page', icon_key: 'celebration', sort_order: 85, is_highlighted: false },
  { label: 'Job Opportunities', path: 'https://uyopportunities.jntugv.edu.in/', reference_key: 'nav.job-opportunities', cms_section: 'external', icon_key: 'work', sort_order: 90, is_highlighted: false },
  { label: 'Contact', path: '/contact-us', reference_key: 'nav.contact', cms_section: 'static_page', icon_key: 'drafts', sort_order: 100, is_highlighted: false },
  { label: 'Quick Links', path: '/quicklinks', reference_key: 'nav.quick-links', cms_section: 'dropdown', icon_key: 'link', sort_order: 110, is_highlighted: false },
];

const quickLinkItems = [
  { label: 'Anti-Ragging', path: '/anti-ragging/about', reference_key: 'nav.quick-links.anti-ragging', cms_section: 'static_page', icon_key: 'link', sort_order: 10 },
  { label: 'Alumni Connect', path: 'https://alumni.jntugv.edu.in', reference_key: 'nav.quick-links.alumni-connect', cms_section: 'external', icon_key: 'link', sort_order: 20 },
  { label: 'University Cells & Committees', path: '/university/cells-and-committees', reference_key: 'nav.quick-links.cells-committees', cms_section: 'static_page', icon_key: 'link', sort_order: 30 },
  { label: 'JNTU Act 8 of 2026', path: '/assets/acts/act_8_of_2026.pdf', reference_key: 'nav.quick-links.act-8-2026', cms_section: 'document', icon_key: 'link', sort_order: 40 },
  { label: 'JNTU Act 30 of 2008', path: '/assets/acts/act_30_of_2008.pdf', reference_key: 'nav.quick-links.act-30-2008', cms_section: 'document', icon_key: 'link', sort_order: 50 },
  { label: 'JNTU Act 22 of 2021', path: '/assets/acts/act_22_of_2021.pdf', reference_key: 'nav.quick-links.act-22-2021', cms_section: 'document', icon_key: 'link', sort_order: 60 },
];

const childNavItems = [
  { parent_key: 'nav.about', label: 'About JNTU-GV', path: '/about-us/about-jntugv', reference_key: 'nav.about.about-jntugv', cms_section: 'static_page', sort_order: 10 },
  { parent_key: 'nav.about', label: 'Vision', path: '/about-us/vision', reference_key: 'nav.about.vision', cms_section: 'static_page', sort_order: 20 },
  { parent_key: 'nav.about', label: 'Mission', path: '/about-us/mission', reference_key: 'nav.about.mission', cms_section: 'static_page', sort_order: 30 },
  { parent_key: 'nav.about', label: 'University Best Practices', path: '/university/best-practices', reference_key: 'nav.about.best-practices', cms_section: 'static_page', sort_order: 40 },
  { parent_key: 'nav.administration', label: 'Chancellor', path: '/administration/chancellor', reference_key: 'nav.administration.chancellor', cms_section: 'directors', sort_order: 10 },
  { parent_key: 'nav.administration', label: 'Vice Chancellor', path: '/administration/vice-chancellor', reference_key: 'nav.administration.vice-chancellor', cms_section: 'directors', sort_order: 20 },
  { parent_key: 'nav.administration', label: 'Registrar', path: '/administration/registrar', reference_key: 'nav.administration.registrar', cms_section: 'directors', sort_order: 30 },
  { parent_key: 'nav.administration', label: 'Officer on Special Duty (OSD)', path: '/administration/osd', reference_key: 'nav.administration.osd', cms_section: 'directors', sort_order: 40 },
  { parent_key: 'nav.academics', label: 'Programs offered', path: '/academics/programs-offered', reference_key: 'nav.academics.programs-offered', cms_section: 'static_page', sort_order: 10 },
  { parent_key: 'nav.academics', label: 'Admissions', path: '/academics/admissions', reference_key: 'nav.academics.admissions', cms_section: 'static_page', sort_order: 20 },
  { parent_key: 'nav.academics', label: 'Constituent Colleges', path: '/academics/constituent-colleges', reference_key: 'nav.academics.constituent-colleges', cms_section: 'colleges', sort_order: 30 },
  { parent_key: 'nav.academics', label: 'Affiliated Colleges', path: '/academics/affliated-colleges', reference_key: 'nav.academics.affiliated-colleges', cms_section: 'colleges', sort_order: 40 },
  { parent_key: 'nav.academics', label: 'Autonomous Colleges', path: '/academics/autonomous-colleges', reference_key: 'nav.academics.autonomous-colleges', cms_section: 'colleges', sort_order: 50 },
  { parent_key: 'nav.academics', label: 'BOS Chairman', path: '/academics/bos-chairman', reference_key: 'nav.academics.bos-chairman', cms_section: 'static_page', sort_order: 60 },
  { parent_key: 'nav.academics', label: 'Academic Calendar', path: '/academics/Calendar', reference_key: 'nav.academics.calendar', cms_section: 'notification_console', sort_order: 70 },
  { parent_key: 'nav.academics', label: 'Academic Syllabus', path: '/academics/academic-syllabus', reference_key: 'nav.academics.syllabus', cms_section: 'notification_console', sort_order: 80 },
  { parent_key: 'nav.academics', label: 'Academic Regulations', path: '/academics/academic-regulations', reference_key: 'nav.academics.regulations', cms_section: 'notification_console', sort_order: 90 },
  { parent_key: 'nav.directorates', label: 'Academic Audit and Planning', path: '/directorates/academic-audit-planning', reference_key: 'nav.directorates.academic-audit-planning', cms_section: 'professionals', sort_order: 10 },
  { parent_key: 'nav.directorates', label: 'Admissions', path: '/directorates/admissions', reference_key: 'nav.directorates.admissions', cms_section: 'professionals', sort_order: 20 },
  { parent_key: 'nav.directorates', label: 'Evaluation', path: '/directorates/evaluation', reference_key: 'nav.directorates.evaluation', cms_section: 'professionals', sort_order: 30 },
  { parent_key: 'nav.directorates', label: 'Research & Development', path: '/directorates/research', reference_key: 'nav.directorates.research', cms_section: 'professionals', sort_order: 40 },
  { parent_key: 'nav.directorates', label: 'Industrial Relations & Placements', path: '/directorates/placements', reference_key: 'nav.directorates.placements', cms_section: 'professionals', sort_order: 50 },
  { parent_key: 'nav.directorates', label: 'Internal Quality Assurance Cell', path: '/directorates/iqac', reference_key: 'nav.directorates.iqac', cms_section: 'professionals', sort_order: 60 },
  { parent_key: 'nav.directorates', label: 'Alumni Relations', path: '/directorates/alumni-relations', reference_key: 'nav.directorates.alumni-relations', cms_section: 'professionals', sort_order: 70 },
  { parent_key: 'nav.examinations', label: 'Controller of Examinations', path: '/examination/controller', reference_key: 'nav.examinations.controller', cms_section: 'static_page', sort_order: 10 },
  { parent_key: 'nav.examinations', label: 'Additional Controller of Examinations-SDC', path: '/examination/controller-sdc', reference_key: 'nav.examinations.controller-sdc', cms_section: 'static_page', sort_order: 20 },
  { parent_key: 'nav.examinations', label: 'Additional Controller of Examinations-1', path: '/examination/controller1', reference_key: 'nav.examinations.controller1', cms_section: 'static_page', sort_order: 30 },
  { parent_key: 'nav.examinations', label: 'Additional Controller of Examinations-2', path: '/examination/controller2', reference_key: 'nav.examinations.controller2', cms_section: 'static_page', sort_order: 40 },
  { parent_key: 'nav.examinations', label: 'Additional Controller of Examinations-3', path: '/examination/controller3', reference_key: 'nav.examinations.controller3', cms_section: 'static_page', sort_order: 50 },
  { parent_key: 'nav.examinations', label: 'Additional Controller of Examinations-4', path: '/examination/controller4', reference_key: 'nav.examinations.controller4', cms_section: 'static_page', sort_order: 60 },
  { parent_key: 'nav.examinations', label: 'Additional Controller of Examinations-PG', path: '/examination/controller-pg', reference_key: 'nav.examinations.controller-pg', cms_section: 'static_page', sort_order: 70 },
  { parent_key: 'nav.examinations', label: 'Examination Results', path: 'https://exams.jntugv.edu.in/results', reference_key: 'nav.examinations.results', cms_section: 'external', sort_order: 80 },
  { parent_key: 'nav.examinations', label: 'Student Certificates', path: 'https://exams.jntugv.edu.in/student/login', reference_key: 'nav.examinations.certificates', cms_section: 'external', sort_order: 90 },
  { parent_key: 'nav.certification', label: 'PGCPAITL', path: 'https://pgcpaitl.jntugv.edu.in', reference_key: 'nav.certification.pgcpaitl', cms_section: 'external', sort_order: 10 },
  { parent_key: 'nav.certification', label: 'Emerging Technologies', path: 'https://emergingtechnologiesbyjntugv.netlify.app/', reference_key: 'nav.certification.emerging-technologies', cms_section: 'external', sort_order: 20 },
  ...quickLinkItems.map((item) => ({ ...item, parent_key: 'nav.quick-links' })),
];

const shouldOpenNewTab = (path = '') =>
  path.startsWith('http') || /\.(pdf|docx?|xlsx?|pptx?)($|[?#])/i.test(path);

exports.site_nav_table = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS site_nav_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      label VARCHAR(100) NOT NULL,
      path VARCHAR(500) NOT NULL,
      reference_key VARCHAR(120) NULL,
      cms_section VARCHAR(80) NOT NULL DEFAULT 'static_page',
      icon_key VARCHAR(50) NOT NULL DEFAULT 'link',
      parent_id INT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      is_highlighted BOOLEAN NOT NULL DEFAULT FALSE,
      open_new_tab BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_site_nav_path (path),
      INDEX idx_site_nav_reference_key (reference_key),
      INDEX idx_site_nav_cms_section (cms_section),
      INDEX idx_site_nav_parent_sort (parent_id, sort_order),
      INDEX idx_site_nav_enabled_sort (is_enabled, sort_order)
    )
  `;

  con.query(sql, (err) => {
    if (err) {
      console.error('Site navigation table not created:', err.message);
      return;
    }

    const ensureNavigationColumns = (done) => {
      con.query(
        `ALTER TABLE site_nav_items ADD COLUMN reference_key VARCHAR(120) NULL AFTER path`,
        (alterErr) => {
          if (alterErr && alterErr.code !== 'ER_DUP_FIELDNAME') {
            console.warn('Site navigation reference_key column not added:', alterErr.message);
          }

          con.query(
            `ALTER TABLE site_nav_items ADD INDEX idx_site_nav_reference_key (reference_key)`,
            (indexErr) => {
              if (indexErr && indexErr.code !== 'ER_DUP_KEYNAME') {
                console.warn('Site navigation reference_key index not added:', indexErr.message);
              }
              con.query(
                `ALTER TABLE site_nav_items ADD COLUMN cms_section VARCHAR(80) NOT NULL DEFAULT 'static_page' AFTER reference_key`,
                (cmsErr) => {
                  if (cmsErr && cmsErr.code !== 'ER_DUP_FIELDNAME') {
                    console.warn('Site navigation cms_section column not added:', cmsErr.message);
                  }

                  con.query(
                    `ALTER TABLE site_nav_items ADD INDEX idx_site_nav_cms_section (cms_section)`,
                    (cmsIndexErr) => {
                      if (cmsIndexErr && cmsIndexErr.code !== 'ER_DUP_KEYNAME') {
                        console.warn('Site navigation cms_section index not added:', cmsIndexErr.message);
                      }
                      done();
                    },
                  );
                },
              );
            },
          );
        },
      );
    };

    const seedChildNavigation = () => {
      const parentKeys = [...new Set(childNavItems.map((item) => item.parent_key))];
      con.query(
        `SELECT id, reference_key FROM site_nav_items WHERE reference_key IN (?)`,
        [parentKeys],
        (parentErr, rows) => {
          if (parentErr) {
            console.warn('Navigation parents not loaded:', parentErr.message);
            return;
          }

          const parentByKey = new Map((rows || []).map((row) => [row.reference_key, row.id]));

          childNavItems.forEach((item) => {
            const parentId = parentByKey.get(item.parent_key);
            if (!parentId) return;
            con.query(
              `INSERT INTO site_nav_items
                (label, path, reference_key, cms_section, icon_key, parent_id, sort_order, is_enabled, is_highlighted, open_new_tab)
               VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, FALSE, ?)
               ON DUPLICATE KEY UPDATE
                 label = VALUES(label),
                 reference_key = VALUES(reference_key),
                 cms_section = VALUES(cms_section),
                 icon_key = VALUES(icon_key),
                 parent_id = VALUES(parent_id),
                 sort_order = VALUES(sort_order),
                 open_new_tab = VALUES(open_new_tab)`,
              [
                item.label,
                item.path,
                item.reference_key,
                item.cms_section,
                item.icon_key,
                parentId,
                item.sort_order,
                shouldOpenNewTab(item.path),
              ],
            );
          });
        },
      );
    };

    const seedDefaultNavigation = () => {
      let pending = defaultNavItems.length;
      defaultNavItems.forEach((item) => {
      con.query(
        `INSERT INTO site_nav_items
          (label, path, reference_key, cms_section, icon_key, sort_order, is_enabled, is_highlighted, open_new_tab)
         VALUES (?, ?, ?, ?, ?, ?, TRUE, ?, ?)
         ON DUPLICATE KEY UPDATE
           label = VALUES(label),
           reference_key = VALUES(reference_key),
           cms_section = VALUES(cms_section),
           icon_key = VALUES(icon_key),
           sort_order = VALUES(sort_order),
           is_highlighted = VALUES(is_highlighted),
           open_new_tab = VALUES(open_new_tab)`,
        [
          item.label,
          item.path,
          item.reference_key,
          item.cms_section,
          item.icon_key,
          item.sort_order,
          item.is_highlighted,
          shouldOpenNewTab(item.path),
        ],
        () => {
          pending -= 1;
          if (pending === 0) seedChildNavigation();
        },
      );
    });
    };

    ensureNavigationColumns(() => {
      con.query(
        `UPDATE site_nav_items
         SET cms_section = 'professionals'
         WHERE cms_section = 'directorate_uploads'`,
        (profileSectionErr) => {
          if (profileSectionErr) {
            console.warn('Existing directorate_uploads CMS section not migrated:', profileSectionErr.message);
          }
        },
      );
      con.query(
        `DELETE FROM site_nav_items
         WHERE LOWER(label) LIKE '%convocation%'
            OR path IN ('/convocation', '/1st-convocation')`,
        (cleanupErr) => {
          if (cleanupErr) {
            console.warn('Existing duplicate convocation navigation rows not cleaned:', cleanupErr.message);
          }
          seedDefaultNavigation();
        },
      );
    });
  });
};
