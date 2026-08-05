const con = require('../apis/config');

const defaultNavItems = [
  { label: 'Home', path: '/', icon_key: 'home', sort_order: 10, is_highlighted: false },
  { label: 'About', path: '/about-us', icon_key: 'apartment', sort_order: 20, is_highlighted: false },
  { label: 'Administration', path: '/administration', icon_key: 'groups', sort_order: 30, is_highlighted: false },
  { label: 'Academics', path: '/academics', icon_key: 'school', sort_order: 40, is_highlighted: false },
  { label: 'Directorates', path: '/directorates', icon_key: 'person', sort_order: 50, is_highlighted: false },
  { label: 'Examinations', path: '/examination', icon_key: 'description', sort_order: 60, is_highlighted: false },
  { label: 'Certification', path: '/contact-us', icon_key: 'verified', sort_order: 70, is_highlighted: false },
  { label: 'Recruitment', path: '/recruitment', icon_key: 'business', sort_order: 80, is_highlighted: false },
  { label: 'Convocation', path: '/1st-convocation', icon_key: 'celebration', sort_order: 85, is_highlighted: false },
  { label: 'Job Opportunities', path: 'https://uyopportunities.jntugv.edu.in/', icon_key: 'work', sort_order: 90, is_highlighted: false },
  { label: 'Contact', path: '/contact-us', icon_key: 'drafts', sort_order: 100, is_highlighted: false },
  { label: 'Quick Links', path: '/quicklinks', icon_key: 'link', sort_order: 110, is_highlighted: false },
];

const quickLinkItems = [
  { label: 'Anti-Ragging', path: '/anti-ragging/about', icon_key: 'link', sort_order: 10 },
  { label: 'Alumni Connect', path: 'https://alumni.jntugv.edu.in', icon_key: 'link', sort_order: 20 },
  { label: 'University Cells & Committees', path: '/university/cells-and-committees', icon_key: 'link', sort_order: 30 },
  { label: 'JNTU Act 8 of 2026', path: '/assets/acts/act_8_of_2026.pdf', icon_key: 'link', sort_order: 40 },
  { label: 'JNTU Act 30 of 2008', path: '/assets/acts/act_30_of_2008.pdf', icon_key: 'link', sort_order: 50 },
  { label: 'JNTU Act 22 of 2021', path: '/assets/acts/act_22_of_2021.pdf', icon_key: 'link', sort_order: 60 },
];

exports.site_nav_table = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS site_nav_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      label VARCHAR(100) NOT NULL,
      path VARCHAR(500) NOT NULL,
      icon_key VARCHAR(50) NOT NULL DEFAULT 'link',
      parent_id INT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      is_highlighted BOOLEAN NOT NULL DEFAULT FALSE,
      open_new_tab BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_site_nav_path (path),
      INDEX idx_site_nav_parent_sort (parent_id, sort_order),
      INDEX idx_site_nav_enabled_sort (is_enabled, sort_order)
    )
  `;

  con.query(sql, (err) => {
    if (err) {
      console.error('Site navigation table not created:', err.message);
      return;
    }

    const seedQuickLinks = () => {
      con.query(
        `SELECT id FROM site_nav_items WHERE path = '/quicklinks' LIMIT 1`,
        (parentErr, rows) => {
          if (parentErr) {
            console.warn('Quick links parent not loaded:', parentErr.message);
            return;
          }

          const parentId = rows?.[0]?.id;
          if (!parentId) return;

          quickLinkItems.forEach((item) => {
            con.query(
              `INSERT INTO site_nav_items
                (label, path, icon_key, parent_id, sort_order, is_enabled, is_highlighted, open_new_tab)
               VALUES (?, ?, ?, ?, ?, TRUE, FALSE, ?)
               ON DUPLICATE KEY UPDATE
                 label = VALUES(label),
                 icon_key = VALUES(icon_key),
                 parent_id = VALUES(parent_id),
                 sort_order = VALUES(sort_order),
                 open_new_tab = VALUES(open_new_tab)`,
              [
                item.label,
                item.path,
                item.icon_key,
                parentId,
                item.sort_order,
                item.path.startsWith('http'),
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
          (label, path, icon_key, sort_order, is_enabled, is_highlighted, open_new_tab)
         VALUES (?, ?, ?, ?, TRUE, ?, ?)
         ON DUPLICATE KEY UPDATE
           label = VALUES(label),
           icon_key = VALUES(icon_key),
           sort_order = VALUES(sort_order),
           is_highlighted = VALUES(is_highlighted),
           open_new_tab = VALUES(open_new_tab)`,
        [
          item.label,
          item.path,
          item.icon_key,
          item.sort_order,
          item.is_highlighted,
          item.path.startsWith('http'),
        ],
        () => {
          pending -= 1;
          if (pending === 0) seedQuickLinks();
        },
      );
    });
    };

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
};
