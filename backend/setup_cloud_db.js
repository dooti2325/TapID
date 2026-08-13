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
        
        console.log('📄 Executing schema.sql...');
        const schema = fs.readFileSync(path.join(rootDir, 'database/schema.sql'), 'utf8');
        await conn.query(schema);

        console.log('📄 Executing indexes.sql...');
        const indexes = fs.readFileSync(path.join(rootDir, 'database/indexes.sql'), 'utf8');
        await conn.query(indexes);

        console.log('📄 Executing seed.sql...');
        const seed = fs.readFileSync(path.join(rootDir, 'database/seed.sql'), 'utf8');
        await conn.query(seed);

        console.log('📄 Executing triggers.sql...');
        try {
            const triggers = fs.readFileSync(path.join(rootDir, 'database/triggers.sql'), 'utf8');
            await conn.query(triggers);
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
