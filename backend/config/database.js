const mysql = require('mysql2/promise');

const isLocal = !process.env.DB_HOST || process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1' || process.env.DB_HOST === 'db';
const useSSL = process.env.DB_SSL === 'true' || (process.env.DB_SSL !== 'false' && !isLocal);

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'tapid',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: useSSL ? { rejectUnauthorized: false } : undefined
});

module.exports = pool;
