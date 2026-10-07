const db = require('../config/database');

exports.recordAttendance = async (req, res) => {
    const rfid_uid = req.body.rfid_uid || req.body.uid;
    const mac_address = req.body.mac_address;

    try {
        // 1. Find device and its classroom
        const [devices] = await db.execute('SELECT classroom_id, status FROM devices WHERE mac_address = ?', [mac_address]);
        if (devices.length === 0) return res.status(404).json({ message: 'Device not registered' });
        if (devices[0].status === 'revoked') return res.status(403).json({ message: 'Device revoked' });
        const classroom_id = devices[0].classroom_id;

        // 2. Find active session for this classroom
        const cleanUid = rfid_uid ? rfid_uid.trim().toUpperCase() : '';
        const uncolonUid = cleanUid.replace(/[^A-F0-9]/gi, '');
        const colonUid = uncolonUid.match(/.{1,2}/g)?.join(':') || cleanUid;

        const [sessions] = await db.execute(
            'SELECT s.id, s.timetable_id, t.section_id FROM attendance_sessions s LEFT JOIN timetable t ON s.timetable_id = t.id WHERE s.classroom_id = ? AND s.status = ? ORDER BY s.id DESC LIMIT 1',
            [classroom_id, 'active']
        );
        if (sessions.length === 0) {
            try {
                await db.execute(
                    "INSERT INTO audit_logs (action, entity_type, details) VALUES ('ATTENDANCE_FAILED_NO_SESSION', 'device', ?)",
                    [JSON.stringify({ mac_address, classroom_id, uid: cleanUid })]
                );
            } catch (_) {}
            return res.status(400).json({ success: false, status: 'no_session', message: 'No active session in this classroom' });
        }
        const session = sessions[0];
        const session_id = session.id;

        // 3. Find student by RFID (normalize with and without colons/spaces)
        const [cards] = await db.execute(
            "SELECT id, student_id, status FROM rfid_cards WHERE uid = ? OR uid = ? OR REPLACE(uid, ':', '') = ?",
            [cleanUid, colonUid, uncolonUid]
        );
        if (cards.length === 0) {
            try {
                await db.execute(
                    "INSERT INTO audit_logs (action, entity_type, details) VALUES ('ATTENDANCE_UNKNOWN_CARD', 'rfid_card', ?)",
                    [JSON.stringify({ uid: cleanUid, mac_address, classroom_id })]
                );
            } catch (_) {}
            return res.status(404).json({ success: false, status: 'unknown_card', message: 'Card not found' });
        }
        if (cards[0].status !== 'active') {
            try {
                await db.execute(
                    "INSERT INTO audit_logs (action, entity_type, details) VALUES ('ATTENDANCE_INACTIVE_CARD', 'rfid_card', ?)",
                    [JSON.stringify({ uid: cleanUid, mac_address, classroom_id })]
                );
            } catch (_) {}
            return res.status(403).json({ success: false, status: 'inactive_card', message: 'Card not active' });
        }
        
        const card = cards[0];
        const [students] = await db.execute('SELECT s.id, s.name, s.section_id FROM students s WHERE s.id = ?', [card.student_id]);
        if (students.length === 0) return res.status(404).json({ success: false, status: 'student_not_found', message: 'Student not found' });
        const student = students[0];

        // Check proxy flag from hardware or rapid consecutive scan detection
        if (req.body.is_proxy) {
            try {
                await db.execute(
                    "INSERT INTO audit_logs (action, entity_type, entity_id, details) VALUES ('ATTENDANCE_PROXY_DETECTED', 'student', ?, ?)",
                    [student.id, JSON.stringify({ student_name: student.name, uid: cleanUid, mac_address, session_id })]
                );
            } catch (_) {}
            return res.status(429).json({
                success: false,
                status: 'proxy_detected',
                message: 'Proxy attendance warning: Rapid scans detected within 3 seconds',
                student_name: student.name
            });
        }

        // Section validation: If session belongs to a specific section and student section differs
        if (session.section_id && student.section_id && session.section_id !== student.section_id) {
            const [secRows] = await db.execute('SELECT id, name FROM sections WHERE id IN (?, ?)', [session.section_id, student.section_id]);
            const sessName = secRows.find(r => r.id === session.section_id)?.name || '';
            const studName = secRows.find(r => r.id === student.section_id)?.name || '';
            
            const sessBase = sessName.replace('Section', '').trim().charAt(0);
            const studBase = studName.replace('Section', '').trim().charAt(0);

            if (sessBase !== studBase) {
                try {
                    await db.execute(
                        "INSERT INTO audit_logs (action, entity_type, entity_id, details) VALUES ('ATTENDANCE_WRONG_SECTION', 'student', ?, ?)",
                        [student.id, JSON.stringify({ student_name: student.name, student_section_id: student.section_id, session_section_id: session.section_id, mac_address, session_id })]
                    );
                } catch (_) {}
                return res.status(422).json({
                    success: false,
                    status: 'wrong_section',
                    message: `Student belongs to a different section (${studName})`,
                    student_name: student.name
                });
            }
        }

        // 4. Record attendance
        try {
            await db.execute('INSERT INTO attendance (session_id, student_id, rfid_card_id) VALUES (?, ?, ?)', [session_id, student.id, card.id]);
            try {
                await db.execute(
                    "INSERT INTO audit_logs (action, entity_type, entity_id, details) VALUES ('ATTENDANCE_RECORDED', 'student', ?, ?)",
                    [student.id, JSON.stringify({ student_name: student.name, session_id, mac_address })]
                );
            } catch (_) {}
            res.json({ success: true, status: 'success', message: 'Attendance recorded', student_name: student.name });
        } catch (duplicateErr) {
            if (duplicateErr.code === 'ER_DUP_ENTRY') {
                try {
                    await db.execute(
                        "INSERT INTO audit_logs (action, entity_type, entity_id, details) VALUES ('ATTENDANCE_DUPLICATE', 'student', ?, ?)",
                        [student.id, JSON.stringify({ student_name: student.name, session_id, mac_address })]
                    );
                } catch (_) {}
                res.status(409).json({ success: false, status: 'duplicate', message: 'Attendance already recorded', student_name: student.name });
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
    
    if (!Array.isArray(records)) {
        return res.status(400).json({ message: 'records must be an array' });
    }

    if (records.length === 0) {
        return res.status(400).json({ message: 'records array cannot be empty' });
    }

    if (records.length > 50) {
        return res.status(400).json({ message: 'Batch size exceeds maximum limit of 50 records' });
    }

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
                const parsedTime = record.timestamp && !isNaN(new Date(record.timestamp).getTime())
                    ? new Date(record.timestamp)
                    : new Date();
                const [cards] = await db.execute("SELECT id, student_id, status FROM rfid_cards WHERE uid = ? AND status = 'active'", [record.rfid_uid]);
                if (cards.length > 0) {
                    await db.execute('INSERT INTO attendance (session_id, student_id, rfid_card_id, timestamp) VALUES (?, ?, ?, ?)', 
                        [session_id, cards[0].student_id, cards[0].id, parsedTime]);
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
            SELECT a.timestamp, s.name, s.enrollment_number, a.status, rc.uid AS rfid_tag_id, rc.uid AS card_uid 
            FROM attendance a 
            JOIN students s ON a.student_id = s.id 
            LEFT JOIN rfid_cards rc ON a.rfid_card_id = rc.id
            WHERE a.session_id = ? 
            ORDER BY a.timestamp DESC
        `, [session_id]);
        res.json(attendance);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
