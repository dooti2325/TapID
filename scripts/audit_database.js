const db = require('../backend/config/database');

async function audit() {
    console.log('=== DATABASE DEEP AUDIT ===\n');

    // 1. Connection check
    const [dbInfo] = await db.query('SELECT DATABASE() as db, VERSION() as version, @@hostname as host');
    console.log('Connected to DB:', dbInfo[0].db);
    console.log('MySQL Engine Version:', dbInfo[0].version);

    // 2. Tables check
    const [tables] = await db.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log('\nTotal Tables:', tableNames.length);

    // 3. Row counts per table
    console.log('\n--- Table Record Counts ---');
    const counts = {};
    for (const t of tableNames) {
        const [r] = await db.query(`SELECT COUNT(*) as count FROM ${t}`);
        counts[t] = r[0].count;
    }
    console.table(counts);

    // 4. Triggers check
    const [triggers] = await db.query('SHOW TRIGGERS');
    console.log('\n--- Active Triggers ---');
    console.table(triggers.map(tr => ({
        Trigger: tr.Trigger,
        Event: tr.Event,
        Table: tr.Table,
        Timing: tr.Timing
    })));

    // 5. Specific test cards check
    const [cards] = await db.query(`
        SELECT r.uid, s.name, s.enrollment_number, r.status 
        FROM rfid_cards r 
        LEFT JOIN students s ON r.student_id = s.id 
        WHERE r.uid IN ('24:0A:C4:00', '44:71:FD:06', '24:0A:C4:01', '24:0A:C4:02')
    `);
    console.log('\n--- Key Hardware RFID Test Cards ---');
    console.table(cards);

    // 6. Foreign key constraints check
    const [fks] = await db.query(`
        SELECT TABLE_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    console.log('\nTotal Foreign Key Relationships:', fks.length);

    console.log('\n=== AUDIT COMPLETED SUCCESSFULLY ===');
    process.exit(0);
}

audit().catch(e => { console.error('Audit Error:', e); process.exit(1); });
