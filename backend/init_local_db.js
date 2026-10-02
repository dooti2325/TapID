const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        console.log('Connecting to MySQL on 3307 as root...');
        const rootConn = await mysql.createConnection({
            host: 'localhost',
            port: 3307,
            user: 'root',
            password: '',
            multipleStatements: true
        });

        console.log('Setting up database tapid and user tapid_user...');
        await rootConn.query(`
            DROP DATABASE IF EXISTS tapid;
            CREATE DATABASE tapid CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
            GRANT ALL PRIVILEGES ON tapid.* TO 'tapid_user'@'localhost' IDENTIFIED BY 'tapid_password';
            GRANT ALL PRIVILEGES ON tapid.* TO 'tapid_user'@'%' IDENTIFIED BY 'tapid_password';
            FLUSH PRIVILEGES;
        `);
        await rootConn.end();

        console.log('Connecting as tapid_user to tapid...');
        const conn = await mysql.createConnection({
            host: 'localhost',
            port: 3307,
            user: 'tapid_user',
            password: 'tapid_password',
            database: 'tapid',
            charset: 'utf8mb4',
            multipleStatements: true
        });

        const rootDir = path.join(__dirname, '..');
        console.log('Executing schema.sql...');
        const schema = fs.readFileSync(path.join(rootDir, 'database/schema.sql'), 'utf8');
        await conn.query(schema);

        console.log('Executing indexes.sql...');
        const indexes = fs.readFileSync(path.join(rootDir, 'database/indexes.sql'), 'utf8');
        await conn.query(indexes);

        console.log('Executing seed.sql...');
        const seed = fs.readFileSync(path.join(rootDir, 'database/seed.sql'), 'utf8');
        await conn.query(seed);

        console.log('Executing triggers.sql...');
        try {
            const triggers = fs.readFileSync(path.join(rootDir, 'database/triggers.sql'), 'utf8');
            await conn.query(triggers);
        } catch (trigErr) {
            console.log('Triggers note:', trigErr.message);
        }

        const [tables] = await conn.query('SHOW TABLES');
        console.log('Tables initialized:', tables.map(t => Object.values(t)[0]));

        const [users] = await conn.query('SELECT id, email, role FROM users');
        console.table(users);

        await conn.end();
        console.log('LOCAL DATABASE READY!');
    } catch (err) {
        console.error('Database initialization error:', err);
    }
}

main();
