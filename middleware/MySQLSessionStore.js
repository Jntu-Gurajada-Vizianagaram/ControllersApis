const session = require('express-session');

class MySQLSessionStore extends session.Store {
  constructor(connection) {
    super();
    this.connection = connection;
  }

  initialize() {
    return this.connection.promise().query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        sid VARCHAR(128) PRIMARY KEY,
        expires BIGINT NOT NULL,
        data LONGTEXT NOT NULL
      )
    `);
  }

  get(sid, callback) {
    this.connection.query(
      'SELECT data, expires FROM user_sessions WHERE sid = ? LIMIT 1',
      [sid],
      (error, rows) => {
        if (error) return callback(error);
        if (!rows.length || Number(rows[0].expires) <= Date.now()) {
          if (rows.length) this.destroy(sid, () => {});
          return callback(null, null);
        }
        try {
          callback(null, JSON.parse(rows[0].data));
        } catch (parseError) {
          callback(parseError);
        }
      },
    );
  }

  set(sid, sessionData, callback = () => {}) {
    const expires = sessionData.cookie?.expires
      ? new Date(sessionData.cookie.expires).getTime()
      : Date.now() + 24 * 60 * 60 * 1000;
    this.connection.query(
      `INSERT INTO user_sessions (sid, expires, data) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE expires = VALUES(expires), data = VALUES(data)`,
      [sid, expires, JSON.stringify(sessionData)],
      callback,
    );
  }

  destroy(sid, callback = () => {}) {
    this.connection.query('DELETE FROM user_sessions WHERE sid = ?', [sid], callback);
  }

  touch(sid, sessionData, callback = () => {}) {
    this.set(sid, sessionData, callback);
  }
}

module.exports = MySQLSessionStore;
