const connection = require('../config');

const normalizeBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
};

const mapNavRow = (row) => ({
  id: row.id,
  label: row.label,
  path: row.path,
  icon_key: row.icon_key,
  parent_id: row.parent_id,
  sort_order: row.sort_order,
  is_enabled: Boolean(row.is_enabled),
  is_highlighted: Boolean(row.is_highlighted),
  open_new_tab: Boolean(row.open_new_tab),
});

exports.public_navbar = (req, res) => {
  const sql = `
    SELECT id, label, path, icon_key, parent_id, sort_order, is_enabled, is_highlighted, open_new_tab
    FROM site_nav_items
    WHERE is_enabled = TRUE
    ORDER BY COALESCE(parent_id, id), parent_id IS NOT NULL, sort_order, id
  `;

  connection.query(sql, (err, rows) => {
    if (err) {
      console.error('Unable to load public navigation:', err.message);
      return res.status(500).json({ error: 'Unable to load navigation' });
    }
    res.json(rows.map(mapNavRow));
  });
};

exports.admin_navbar = (req, res) => {
  const sql = `
    SELECT id, label, path, icon_key, parent_id, sort_order, is_enabled, is_highlighted, open_new_tab
    FROM site_nav_items
    ORDER BY COALESCE(parent_id, id), parent_id IS NOT NULL, sort_order, id
  `;

  connection.query(sql, (err, rows) => {
    if (err) {
      console.error('Unable to load admin navigation:', err.message);
      return res.status(500).json({ error: 'Unable to load navigation' });
    }
    res.json(rows.map(mapNavRow));
  });
};

exports.create_nav_item = (req, res) => {
  const {
    label,
    path,
    icon_key = 'link',
    parent_id = null,
    sort_order = 0,
  } = req.body || {};

  if (!String(label || '').trim() || !String(path || '').trim()) {
    return res.status(400).json({ error: 'Label and path are required' });
  }

  connection.query(
    `INSERT INTO site_nav_items
      (label, path, icon_key, parent_id, sort_order, is_enabled, is_highlighted, open_new_tab)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      String(label).trim(),
      String(path).trim(),
      String(icon_key || 'link').trim(),
      parent_id || null,
      Number.parseInt(sort_order, 10) || 0,
      normalizeBoolean(req.body.is_enabled, true),
      normalizeBoolean(req.body.is_highlighted, false),
      normalizeBoolean(req.body.open_new_tab, String(path).startsWith('http')),
    ],
    (err, result) => {
      if (err) {
        console.error('Unable to create navigation item:', err.message);
        return res.status(500).json({ error: 'Unable to create navigation item' });
      }
      res.status(201).json({ message: 'Navigation item created', id: result.insertId });
    },
  );
};

exports.update_nav_item = (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid navigation item id' });

  const {
    label,
    path,
    icon_key = 'link',
    parent_id = null,
    sort_order = 0,
  } = req.body || {};

  if (!String(label || '').trim() || !String(path || '').trim()) {
    return res.status(400).json({ error: 'Label and path are required' });
  }

  connection.query(
    `UPDATE site_nav_items
     SET label = ?, path = ?, icon_key = ?, parent_id = ?, sort_order = ?,
         is_enabled = ?, is_highlighted = ?, open_new_tab = ?
     WHERE id = ?`,
    [
      String(label).trim(),
      String(path).trim(),
      String(icon_key || 'link').trim(),
      parent_id || null,
      Number.parseInt(sort_order, 10) || 0,
      normalizeBoolean(req.body.is_enabled, true),
      normalizeBoolean(req.body.is_highlighted, false),
      normalizeBoolean(req.body.open_new_tab, String(path).startsWith('http')),
      id,
    ],
    (err, result) => {
      if (err) {
        console.error('Unable to update navigation item:', err.message);
        return res.status(500).json({ error: 'Unable to update navigation item' });
      }
      if (!result.affectedRows) return res.status(404).json({ error: 'Navigation item not found' });
      res.json({ message: 'Navigation item updated' });
    },
  );
};

exports.delete_nav_item = (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid navigation item id' });

  connection.query('DELETE FROM site_nav_items WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Unable to delete navigation item:', err.message);
      return res.status(500).json({ error: 'Unable to delete navigation item' });
    }
    if (!result.affectedRows) return res.status(404).json({ error: 'Navigation item not found' });
    res.json({ message: 'Navigation item deleted' });
  });
};

const mapVideoRow = (row) => ({
  row_id: row.id,
  id: row.video_id,
  title: row.title,
  publisher: row.publisher,
  embedBlocked: Boolean(row.embed_blocked),
  isActive: Boolean(row.is_active),
  sortOrder: row.sort_order,
});

exports.public_youtube_videos = (req, res) => {
  connection.query(
    `SELECT id, video_id, title, publisher, embed_blocked, is_active, sort_order
     FROM youtube_videos
     WHERE is_active = TRUE
     ORDER BY sort_order ASC, id DESC`,
    (err, rows) => {
      if (err) {
        console.error('Unable to load YouTube videos:', err.message);
        return res.status(500).json({ error: 'Unable to load YouTube videos' });
      }
      res.json(rows.map(mapVideoRow));
    },
  );
};

exports.admin_youtube_videos = (req, res) => {
  connection.query(
    `SELECT id, video_id, title, publisher, embed_blocked, is_active, sort_order
     FROM youtube_videos
     ORDER BY sort_order ASC, id DESC`,
    (err, rows) => {
      if (err) {
        console.error('Unable to load admin YouTube videos:', err.message);
        return res.status(500).json({ error: 'Unable to load YouTube videos' });
      }
      res.json(rows.map(mapVideoRow));
    },
  );
};

exports.create_youtube_video = (req, res) => {
  const { video_id, title, publisher = 'JNTU-GV', embed_blocked = false, is_active = true, sort_order = 0 } = req.body || {};
  if (!String(video_id || '').trim() || !String(title || '').trim()) {
    return res.status(400).json({ error: 'Video ID and title are required' });
  }
  connection.query(
    `INSERT INTO youtube_videos (video_id, title, publisher, embed_blocked, is_active, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      String(video_id).trim(),
      String(title).trim(),
      String(publisher || 'JNTU-GV').trim(),
      normalizeBoolean(embed_blocked, false),
      normalizeBoolean(is_active, true),
      Number.parseInt(sort_order, 10) || 0,
    ],
    (err, result) => {
      if (err) {
        console.error('Unable to create YouTube video:', err.message);
        return res.status(500).json({ error: 'Unable to create YouTube video' });
      }
      res.status(201).json({ message: 'YouTube video created', id: result.insertId });
    },
  );
};

exports.update_youtube_video = (req, res) => {
  const rowId = Number.parseInt(req.params.id, 10);
  const { video_id, title, publisher = 'JNTU-GV', embed_blocked = false, is_active = true, sort_order = 0 } = req.body || {};
  if (!rowId) return res.status(400).json({ error: 'Invalid video row id' });
  if (!String(video_id || '').trim() || !String(title || '').trim()) {
    return res.status(400).json({ error: 'Video ID and title are required' });
  }
  connection.query(
    `UPDATE youtube_videos
     SET video_id = ?, title = ?, publisher = ?, embed_blocked = ?, is_active = ?, sort_order = ?
     WHERE id = ?`,
    [
      String(video_id).trim(),
      String(title).trim(),
      String(publisher || 'JNTU-GV').trim(),
      normalizeBoolean(embed_blocked, false),
      normalizeBoolean(is_active, true),
      Number.parseInt(sort_order, 10) || 0,
      rowId,
    ],
    (err, result) => {
      if (err) {
        console.error('Unable to update YouTube video:', err.message);
        return res.status(500).json({ error: 'Unable to update YouTube video' });
      }
      if (!result.affectedRows) return res.status(404).json({ error: 'YouTube video not found' });
      res.json({ message: 'YouTube video updated' });
    },
  );
};

exports.delete_youtube_video = (req, res) => {
  const rowId = Number.parseInt(req.params.id, 10);
  if (!rowId) return res.status(400).json({ error: 'Invalid video row id' });
  connection.query('DELETE FROM youtube_videos WHERE id = ?', [rowId], (err, result) => {
    if (err) {
      console.error('Unable to delete YouTube video:', err.message);
      return res.status(500).json({ error: 'Unable to delete YouTube video' });
    }
    if (!result.affectedRows) return res.status(404).json({ error: 'YouTube video not found' });
    res.json({ message: 'YouTube video deleted' });
  });
};
