const con = require('../apis/config');

const defaultNavItems = [
  { label: 'HOME', path: '/', icon_key: 'home', sort_order: 10, is_highlighted: false },
  { label: '1ST CONVOCATION', path: '/convocation', icon_key: 'verified', sort_order: 15, is_highlighted: true },
  { label: 'ABOUT US', path: '/about-us', icon_key: 'apartment', sort_order: 20, is_highlighted: false },
  { label: 'ADMINISTRATION', path: '/administration', icon_key: 'groups', sort_order: 30, is_highlighted: false },
  { label: 'ACADEMICS', path: '/academics', icon_key: 'school', sort_order: 40, is_highlighted: false },
  { label: 'DIRECTORATES', path: '/directorates', icon_key: 'person', sort_order: 50, is_highlighted: false },
  { label: 'EXAMINATIONS', path: '/examination', icon_key: 'description', sort_order: 60, is_highlighted: false },
  { label: 'CERTIFICATION COURSES', path: '/contact-us', icon_key: 'verified', sort_order: 70, is_highlighted: false },
  { label: 'RECRUITMENT', path: '/recruitment', icon_key: 'business', sort_order: 80, is_highlighted: false },
  { label: 'JOB OPPORTUNITIES', path: 'https://uyopportunities.jntugv.edu.in/', icon_key: 'work', sort_order: 90, is_highlighted: false },
  { label: 'CONTACT US', path: '/contact-us', icon_key: 'drafts', sort_order: 100, is_highlighted: false },
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

    defaultNavItems.forEach((item) => {
      con.query(
        `INSERT INTO site_nav_items
          (label, path, icon_key, sort_order, is_enabled, is_highlighted, open_new_tab)
         VALUES (?, ?, ?, ?, TRUE, ?, ?)
         ON DUPLICATE KEY UPDATE label = label`,
        [
          item.label,
          item.path,
          item.icon_key,
          item.sort_order,
          item.is_highlighted,
          item.path.startsWith('http'),
        ],
      );
    });
  });
};
