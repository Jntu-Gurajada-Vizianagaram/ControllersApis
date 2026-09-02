-- JNTU-GV normalized public people + position assignment seed.
-- Run after deployment from ControllersApis:
-- mysql -u <user> -p <database> < db/website_people_position_assignments_seed.sql

SET @api_base := 'https://api.jntugv.edu.in';

CREATE TABLE IF NOT EXISTS website_people (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(80),
  department VARCHAR(255),
  academic_title VARCHAR(255),
  qualifications VARCHAR(500),
  image_url VARCHAR(1000),
  about MEDIUMTEXT,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX website_people_status_idx (status)
);

CREATE TABLE IF NOT EXISTS website_position_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  person_id INT NOT NULL,
  position_type VARCHAR(80) NOT NULL DEFAULT 'administration',
  position_key VARCHAR(120) NOT NULL,
  position_label VARCHAR(255) NOT NULL,
  directorate_name VARCHAR(255),
  title_override VARCHAR(255),
  subtitle_override VARCHAR(500),
  email_override VARCHAR(255),
  website_url VARCHAR(500),
  is_incharge BOOLEAN NOT NULL DEFAULT FALSE,
  visibility VARCHAR(40) NOT NULL DEFAULT 'public',
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY website_position_assignments_key_uq (position_key),
  INDEX website_position_assignments_public_idx (position_type, visibility, status)
);

DELETE FROM website_position_assignments
WHERE position_key IN (
  'vice-chancellor',
  'registrar',
  'osd',
  'academic-audit-planning',
  'academic-audit',
  'academic-planning',
  'admissions',
  'evaluation',
  'research',
  'placements',
  'iqac',
  'alumni-relations',
  'sports-administration'
);

DELETE FROM website_people
WHERE email IN (
  'vc@jntugv.edu.in',
  'registrar@jntugv.edu.in',
  'osd@jntugv.edu.in',
  'daa@jntugv.edu.in',
  'dap@jntugv.edu.in',
  'de@jntugv.edu.in',
  'dr@jntugv.edu.in',
  'dirp@jntugv.edu.in'
)
OR name IN (
  'Prof. Dr. G. Jaya Suma',
  'Dr. G.J. Naga Raju',
  'Dr. K. Sri Kumar'
);

INSERT INTO website_people
  (name, email, department, academic_title, qualifications, image_url, about, sort_order, status)
VALUES
  ('Prof. V. V. Subba Rao', 'vc@jntugv.edu.in', 'Mechanical Engineering', 'Professor of Mechanical Engineering', 'Ph.D., IIT Kharagpur | Post-Doctoral Fellowship, Hoseo University, South Korea', CONCAT(@api_base, '/leadership-profile-images/vc.png'), 'Prof. V. V. Subba Rao is the Vice-Chancellor of Jawaharlal Nehru Technological University - Gurajada, Vizianagaram.', 10, 'active'),
  ('Dr. K. Chandra Bhushana Rao', 'registrar@jntugv.edu.in', 'Electronics and Communication Engineering', 'Professor, Department of Electronics and Communication Engineering', 'B.E., M.E., Ph.D. in Electronics and Communication Engineering', CONCAT(@api_base, '/leadership-profile-images/kcb_rao.jpeg'), 'Dr. Kota Chandra Bhushana Rao is currently serving as Registrar (i/c) of JNTU-GV, Vizianagaram. He has over 29 years of teaching, research, and administrative experience in engineering education.', 40, 'active'),
  ('Dr. Shaik Kalesha Vali', 'osd@jntugv.edu.in', 'BS&HSS', 'Professor of Mathematics', 'M.Sc., M.Phil., Ph.D. in Mathematics', CONCAT(@api_base, '/leadership-profile-images/osd.jpeg'), 'Dr. S. Kalesha Vali is serving as Officer on Special Duty (OSD) to the Hon''ble Vice-Chancellor, JNTU-GV.', 50, 'active'),
  ('Prof. Dr. G. Jaya Suma', 'dap@jntugv.edu.in', 'Information Technology', 'Professor', NULL, CONCAT(@api_base, '/director-images/jayasuma.jpeg'), NULL, 60, 'active'),
  ('Prof. G. Swami Naidu', 'dr@jntugv.edu.in', 'Metallurgical Engineering', 'Professor', NULL, CONCAT(@api_base, '/director-images/dr_and_d.jpg'), NULL, 70, 'active'),
  ('Dr. G.J. Naga Raju', 'daa@jntugv.edu.in', 'Physics', 'Professor', NULL, CONCAT(@api_base, '/director-images/gjn.jpg'), NULL, 80, 'active'),
  ('Directorate of Evaluation', 'de@jntugv.edu.in', NULL, 'Director of Evaluation', NULL, NULL, NULL, 90, 'active');

INSERT INTO website_position_assignments
  (person_id, position_type, position_key, position_label, directorate_name, title_override, subtitle_override, email_override, website_url, is_incharge, visibility, status, sort_order)
SELECT id, 'administration', 'vice-chancellor', 'Vice Chancellor', 'Vice-Chancellor Office', 'Hon''ble Vice-Chancellor', qualifications, 'vc@jntugv.edu.in', NULL, 0, 'public', 'active', 10
FROM website_people WHERE email = 'vc@jntugv.edu.in'
ON DUPLICATE KEY UPDATE person_id = VALUES(person_id), position_label = VALUES(position_label), directorate_name = VALUES(directorate_name), title_override = VALUES(title_override), subtitle_override = VALUES(subtitle_override), email_override = VALUES(email_override), visibility = VALUES(visibility), status = VALUES(status), sort_order = VALUES(sort_order);

INSERT INTO website_position_assignments
  (person_id, position_type, position_key, position_label, directorate_name, title_override, subtitle_override, email_override, website_url, is_incharge, visibility, status, sort_order)
SELECT id, 'administration', 'registrar', 'Registrar', 'Registrar Office', 'Registrar (i/c)', qualifications, 'registrar@jntugv.edu.in', NULL, 0, 'public', 'active', 40
FROM website_people WHERE email = 'registrar@jntugv.edu.in'
ON DUPLICATE KEY UPDATE person_id = VALUES(person_id), position_label = VALUES(position_label), directorate_name = VALUES(directorate_name), title_override = VALUES(title_override), subtitle_override = VALUES(subtitle_override), email_override = VALUES(email_override), visibility = VALUES(visibility), status = VALUES(status), sort_order = VALUES(sort_order);

INSERT INTO website_position_assignments
  (person_id, position_type, position_key, position_label, directorate_name, title_override, subtitle_override, email_override, website_url, is_incharge, visibility, status, sort_order)
SELECT id, 'administration', 'osd', 'Officer on Special Duty (OSD)', 'Office of the Hon''ble Vice-Chancellor', 'Officer on Special Duty (OSD)', qualifications, 'osd@jntugv.edu.in', NULL, 0, 'public', 'active', 50
FROM website_people WHERE email = 'osd@jntugv.edu.in'
ON DUPLICATE KEY UPDATE person_id = VALUES(person_id), position_label = VALUES(position_label), directorate_name = VALUES(directorate_name), title_override = VALUES(title_override), subtitle_override = VALUES(subtitle_override), email_override = VALUES(email_override), visibility = VALUES(visibility), status = VALUES(status), sort_order = VALUES(sort_order);

INSERT INTO website_position_assignments
  (person_id, position_type, position_key, position_label, directorate_name, title_override, subtitle_override, email_override, website_url, is_incharge, visibility, status, sort_order)
SELECT id, 'directorate', 'academic-audit-planning', 'Director of Academic Audit and Planning', 'Directorate of Academic Audit and Planning', 'Director of Academic Audit and Planning', department, 'daap@jntugv.edu.in', 'https://daap.jntugv.edu.in', 0, 'public', 'active', 10
FROM website_people WHERE email = 'daap@jntugv.edu.in'
ON DUPLICATE KEY UPDATE person_id = VALUES(person_id), position_label = VALUES(position_label), directorate_name = VALUES(directorate_name), title_override = VALUES(title_override), subtitle_override = VALUES(subtitle_override), email_override = VALUES(email_override), website_url = VALUES(website_url), visibility = VALUES(visibility), status = VALUES(status), sort_order = VALUES(sort_order);

INSERT INTO website_position_assignments
  (person_id, position_type, position_key, position_label, directorate_name, title_override, subtitle_override, email_override, website_url, is_incharge, visibility, status, sort_order)
SELECT id, 'directorate', 'admissions', 'Director of Admissions', 'Directorate of Admissions', 'Director of Admissions', department, 'da@jntugv.edu.in', 'https://admissions.jntugv.edu.in', 0, 'public', 'active', 20
FROM website_people WHERE email = 'da@jntugv.edu.in'
ON DUPLICATE KEY UPDATE person_id = VALUES(person_id), position_label = VALUES(position_label), directorate_name = VALUES(directorate_name), title_override = VALUES(title_override), subtitle_override = VALUES(subtitle_override), email_override = VALUES(email_override), website_url = VALUES(website_url), visibility = VALUES(visibility), status = VALUES(status), sort_order = VALUES(sort_order);

INSERT INTO website_position_assignments
  (person_id, position_type, position_key, position_label, directorate_name, title_override, subtitle_override, email_override, website_url, is_incharge, visibility, status, sort_order)
SELECT id, 'directorate', 'evaluation', 'Director of Evaluation', 'Directorate of Evaluation', 'Director of Evaluation', department, 'de@jntugv.edu.in', NULL, 1, 'public', 'active', 30
FROM website_people WHERE email = 'de@jntugv.edu.in'
ON DUPLICATE KEY UPDATE person_id = VALUES(person_id), position_label = VALUES(position_label), directorate_name = VALUES(directorate_name), title_override = VALUES(title_override), subtitle_override = VALUES(subtitle_override), email_override = VALUES(email_override), website_url = VALUES(website_url), is_incharge = VALUES(is_incharge), visibility = VALUES(visibility), status = VALUES(status), sort_order = VALUES(sort_order);

INSERT INTO website_position_assignments
  (person_id, position_type, position_key, position_label, directorate_name, title_override, subtitle_override, email_override, website_url, is_incharge, visibility, status, sort_order)
SELECT id, 'directorate', 'research', 'Director of Research & Development', 'Directorate of Research & Development', 'Director of Research & Development', department, 'dr@jntugv.edu.in', 'https://drnd.jntugv.edu.in/', 0, 'public', 'active', 50
FROM website_people WHERE email = 'dr@jntugv.edu.in'
ON DUPLICATE KEY UPDATE person_id = VALUES(person_id), position_label = VALUES(position_label), directorate_name = VALUES(directorate_name), title_override = VALUES(title_override), subtitle_override = VALUES(subtitle_override), email_override = VALUES(email_override), website_url = VALUES(website_url), visibility = VALUES(visibility), status = VALUES(status), sort_order = VALUES(sort_order);

INSERT INTO website_position_assignments
  (person_id, position_type, position_key, position_label, directorate_name, title_override, subtitle_override, email_override, website_url, is_incharge, visibility, status, sort_order)
SELECT id, 'directorate', 'placements', 'Director i/c of Industrial Relations & Placements', 'Directorate of Industrial Relations & Placements', 'Director i/c of Industrial Relations & Placements', department, 'dirp@jntugv.edu.in', NULL, 0, 'public', 'active', 60
FROM website_people WHERE name = 'Dr. K. Sri Kumar'
ON DUPLICATE KEY UPDATE person_id = VALUES(person_id), position_label = VALUES(position_label), directorate_name = VALUES(directorate_name), title_override = VALUES(title_override), subtitle_override = VALUES(subtitle_override), email_override = VALUES(email_override), website_url = VALUES(website_url), visibility = VALUES(visibility), status = VALUES(status), sort_order = VALUES(sort_order);

INSERT INTO website_position_assignments
  (person_id, position_type, position_key, position_label, directorate_name, title_override, subtitle_override, email_override, website_url, is_incharge, visibility, status, sort_order)
SELECT id, 'directorate', 'iqac', 'Director (i/c), IQAC', 'Internal Quality Assurance Cell', 'Director (i/c), IQAC', department, 'diqac@jntugv.edu.in', NULL, 0, 'public', 'active', 60
FROM website_people WHERE email = 'diqac@jntugv.edu.in'
ON DUPLICATE KEY UPDATE person_id = VALUES(person_id), position_label = VALUES(position_label), directorate_name = VALUES(directorate_name), title_override = VALUES(title_override), subtitle_override = VALUES(subtitle_override), email_override = VALUES(email_override), website_url = VALUES(website_url), visibility = VALUES(visibility), status = VALUES(status), sort_order = VALUES(sort_order);

INSERT INTO website_position_assignments
  (person_id, position_type, position_key, position_label, directorate_name, title_override, subtitle_override, email_override, website_url, is_incharge, visibility, status, sort_order)
SELECT id, 'directorate', 'alumni-relations', 'Director of Alumni Relations', 'Directorate of Alumni Relations', 'Director of Alumni Relations', department, 'dar@jntugv.edu.in', NULL, 0, 'public', 'active', 80
FROM website_people WHERE name = 'Dr. K. Sri Kumar'
ON DUPLICATE KEY UPDATE person_id = VALUES(person_id), position_label = VALUES(position_label), directorate_name = VALUES(directorate_name), title_override = VALUES(title_override), subtitle_override = VALUES(subtitle_override), email_override = VALUES(email_override), website_url = VALUES(website_url), visibility = VALUES(visibility), status = VALUES(status), sort_order = VALUES(sort_order);