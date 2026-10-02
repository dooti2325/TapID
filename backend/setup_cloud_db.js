const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Usage: node setup_cloud_db.js <HOST> <PORT> <PASSWORD> [USER] [DATABASE]
// Or set in .env and run: node setup_cloud_db.js

const args = process.argv.slice(2);
const host = args[0] || process.env.DB_HOST;
const port = Number(args[1] || process.env.DB_PORT || 3306);
const password = args[2] || process.env.DB_PASS;
const user = args[3] || process.env.DB_USER || 'avnadmin';
const database = args[4] || process.env.DB_NAME || 'defaultdb';

if (!host || !password || host === 'YOUR_AIVEN_HOST') {
    console.error('❌ Error: Missing credentials!');
    console.log('\nUsage:');
    console.log('  node setup_cloud_db.js <HOST> <PORT> <PASSWORD> [USER] [DATABASE]');
    console.log('\nExample:');
    console.log('  node setup_cloud_db.js mysql-29b06aa6-xxx.aivencloud.com 12345 secretPassword avnadmin defaultdb\n');
    process.exit(1);
}

async function run() {
    console.log(`🔌 Connecting to cloud database at ${host}:${port} (${database})...`);
    
    let conn;
    try {
        conn = await mysql.createConnection({
            host,
            port,
            user,
            password,
            database,
            ssl: { rejectUnauthorized: false },
            multipleStatements: true
        });
        console.log('✅ Connected successfully!');

        const rootDir = path.join(__dirname, '..');
        
        console.log('🧹 Preparing clean database tapid...');
        await conn.query('DROP DATABASE IF EXISTS tapid');
        await conn.query('CREATE DATABASE tapid CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        await conn.query('USE tapid');

        console.log('📄 Executing schema.sql...');
        const schema = fs.readFileSync(path.join(rootDir, 'database/schema.sql'), 'utf8');
        await conn.query(schema);

        console.log('📄 Executing indexes.sql...');
        try {
            const indexes = fs.readFileSync(path.join(rootDir, 'database/indexes.sql'), 'utf8');
            const statements = indexes.split(';').map(s => s.trim()).filter(Boolean);
            for (const stmt of statements) {
                try {
                    await conn.query(stmt);
                } catch (idxErr) {
                    if (!idxErr.message.includes('Duplicate key name') && !idxErr.message.includes('already exists')) {
                        console.log('Index note:', idxErr.message);
                    }
                }
            }
        } catch (idxErr) {
            console.log('ℹ️ Indexes notice:', idxErr.message);
        }

        console.log('📄 Executing seed.sql...');
        const seed = fs.readFileSync(path.join(rootDir, 'database/seed.sql'), 'utf8');
        await conn.query(seed);

        console.log('📄 Executing triggers...');
        try {
            await conn.query('DROP TRIGGER IF EXISTS after_session_start');
            await conn.query(`
                CREATE TRIGGER after_session_start
                AFTER INSERT ON attendance_sessions
                FOR EACH ROW
                BEGIN
                    UPDATE devices 
                    SET status = 'online' 
                    WHERE classroom_id = NEW.classroom_id AND status != 'revoked';
                END
            `);
            await conn.query('DROP TRIGGER IF EXISTS after_session_end');
            await conn.query(`
                CREATE TRIGGER after_session_end
                AFTER UPDATE ON attendance_sessions
                FOR EACH ROW
                BEGIN
                    IF NEW.status = 'completed' AND OLD.status = 'active' THEN
                        UPDATE devices 
                        SET status = 'offline' 
                        WHERE classroom_id = NEW.classroom_id AND status != 'revoked';
                    END IF;
                END
            `);
            console.log('⚡ Triggers configured successfully!');
        } catch (trigErr) {
            console.log('ℹ️ Triggers skipped (cloud DB permissions):', trigErr.message);
        }

        const [tables] = await conn.query('SHOW TABLES');
        console.log('\n🎉 Setup complete! Created tables:', tables.map(t => Object.values(t)[0]));
        
        const [users] = await conn.query('SELECT id, email, role FROM users');
        console.log('\n👥 Seeded default users:');
        console.table(users);
        
    } catch (err) {
        console.error('\n❌ Setup failed:', err.message);
    } finally {
        if (conn) await conn.end();
    }
}

run();
