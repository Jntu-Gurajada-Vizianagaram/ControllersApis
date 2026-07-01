const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const mysql = require('mysql2');

const requiredDatabaseVariables = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingDatabaseVariables = process.env.DATABASE_URL
  ? []
  : requiredDatabaseVariables.filter(name => !String(process.env[name] || '').trim());

if (missingDatabaseVariables.length) {
  throw new Error(
    `Database configuration is incomplete. Set ${missingDatabaseVariables.join(', ')} in ControllersApis/.env`,
  );
}

const connectionOptions = process.env.DATABASE_URL || {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT_MS || 10000),
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

const connection = mysql.createPool(connectionOptions);

module.exports = connection;
