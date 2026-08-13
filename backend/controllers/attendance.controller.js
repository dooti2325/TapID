const db = require('../config/database');

exports.recordAttendance = async (req, res) => {
    const { rfid_uid, mac_address } = req.body;

    try {
        // 1. Find device and its classroom
        const [devices] = await db.execute('SELECT classroom_id, status FROM devices WHERE mac_address = ?', [mac_address]);
        if (devices.length === 0) return res.status(404).json({ message: 'Device not registered' });
        if (devices[0].status === 'revoked') return res.status(403).json({ message: 'Device revoked' });
        const classroom_id = devices[0].classroom_id;

        // 2. Find active session for this classroom
        const [sessions] = await db.execute('SELECT id FROM attendance_sessions WHERE classroom_id = ? AND status = ?', [classroom_id, 'active']);
        if (sessions.length === 0) return res.status(400).json({ message: 'No active session in this classroom' });
        const session_id = sessions[0].id;

        // 3. Find student by RFID
        const [cards] = await db.execute('SELECT id, student_id, status FROM rfid_cards WHERE uid = ?', [rfid_uid]);
        if (cards.length === 0) return res.status(404).json({ message: 'Card not found' });
        if (cards[0].status !== 'active') return res.status(403).json({ message: 'Card not active' });
        
        const card = cards[0];
        const [students] = await db.execute('SELECT id, name FROM students WHERE id = ?', [card.student_id]);
        if (students.length === 0) return res.status(404).json({ message: 'Student not found' });
        const student = students[0];

        // 4. Record attendance
        try {
            await db.execute('INSERT INTO attendance (session_id, student_id, rfid_card_id) VALUES (?, ?, ?)', [session_id, student.id, card.id]);
            res.json({ success: true, message: 'Attendance recorded', student_name: student.name });
        } catch (duplicateErr) {
            if (duplicateErr.code === 'ER_DUP_ENTRY') {
                res.status(409).json({ success: false, message: 'Attendance already recorded' });
            } else {
                throw duplicateErr;
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.bulkRecordAttendance = async (req, res) => {
    const { mac_address, records } = req.body;
    // records: [{ rfid_uid, timestamp }]
    
    try {
        const [devices] = await db.execute('SELECT classroom_id, status FROM devices WHERE mac_address = ?', [mac_address]);
        if (devices.length === 0 || devices[0].status === 'revoked') return res.status(403).json({ message: 'Device invalid' });
        const classroom_id = devices[0].classroom_id;

        const [sessions] = await db.execute('SELECT id FROM attendance_sessions WHERE classroom_id = ? AND status = ?', [classroom_id, 'active']);
        if (sessions.length === 0) return res.status(400).json({ message: 'No active session' });
        const session_id = sessions[0].id;

        let added = 0;
        let errors = 0;

        for (const record of records) {
            try {
                const [cards] = await db.execute('SELECT id, student_id, status FROM rfid_cards WHERE uid = ? AND status = "active"', [record.rfid_uid]);
                if (cards.length > 0) {
                    await db.execute('INSERT INTO attendance (session_id, student_id, rfid_card_id, timestamp) VALUES (?, ?, ?, ?)', 
                        [session_id, cards[0].student_id, cards[0].id, new Date(record.timestamp)]);
                    added++;
                } else {
                    errors++;
                }
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    // Ignore duplicates in bulk
                } else {
                    errors++;
                }
            }
        }

        res.json({ success: true, added, errors });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getSessionAttendance = async (req, res) => {
    const { session_id } = req.params;
    try {
        const [attendance] = await db.execute(`
            SELECT a.timestamp, s.name, s.enrollment_number, a.status 
            FROM attendance a 
            JOIN students s ON a.student_id = s.id 
            WHERE a.session_id = ? 
            ORDER BY a.timestamp DESC
        `, [session_id]);
        res.json(attendance);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
