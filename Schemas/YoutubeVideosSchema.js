const con = require('../apis/config');

exports.youtube_videos_table = () => {
  con.query(`
    CREATE TABLE IF NOT EXISTS youtube_videos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      video_id VARCHAR(32) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      publisher VARCHAR(120) NOT NULL DEFAULT 'JNTU-GV',
      embed_blocked BOOLEAN NOT NULL DEFAULT FALSE,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_youtube_active_sort (is_active, sort_order, id)
    )
  `, (error) => {
    if (error) {
      console.error('YouTube videos table not created:', error.message);
      return;
    }

    con.query(`
      INSERT IGNORE INTO youtube_videos (video_id, title, publisher, embed_blocked, is_active, sort_order)
      VALUES
        ('_E7Is-_h8u8', 'JNTU Gurajada Opens Germany Job Opportunities for ITI Students || Yuva', 'E-TV Andhra Pradesh', TRUE, TRUE, 10),
        ('nZrDBmIszLI', 'JNTUGV- CEV - Annual & Sports Day Celebrations 2025 - Part 1', 'JNTU-GV', FALSE, TRUE, 20),
        ('o6Fku5fkDmw', 'JNTU-GV Campus Tour 2026', 'JNTU-GV', FALSE, TRUE, 30)
    `);
  });
};
