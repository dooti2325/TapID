const db = require('../config/database');

exports.getDashboardStats = async (req, res) => {
    try {
        const [[{ total_students }]] = await db.query('SELECT COUNT(*) as total_students FROM students');
        const [[{ total_teachers }]] = await db.query("SELECT COUNT(*) as total_teachers FROM users WHERE role = 'faculty'");
        const [[{ total_classrooms }]] = await db.query('SELECT COUNT(*) as total_classrooms FROM classrooms');
        const [[{ total_subjects }]] = await db.query('SELECT COUNT(*) as total_subjects FROM subjects');
        const [[{ active_devices }]] = await db.query('SELECT COUNT(*) as active_devices FROM devices WHERE status = "online"');
        const [[{ active_sessions }]] = await db.query('SELECT COUNT(*) as active_sessions FROM attendance_sessions WHERE status = "active"');
        const [[{ attendance_today }]] = await db.query('SELECT COUNT(*) as attendance_today FROM attendance WHERE DATE(timestamp) = CURDATE()');
        const [[{ revoked_cards }]] = await db.query('SELECT COUNT(*) as revoked_cards FROM rfid_cards WHERE status = "revoked"');
        const [[{ unassigned_cards }]] = await db.query('SELECT COUNT(*) as unassigned_cards FROM rfid_cards WHERE student_id IS NULL');
        const [[{ offline_devices }]] = await db.query('SELECT COUNT(*) as offline_devices FROM devices WHERE status = "offline"');

        const [recent_sessions] = await db.query(`
            SELECT
                sess.id,
                sess.session_date,
                sess.start_time,
                sess.end_time,
                sess.status,
                sub.name AS subject_name,
                c.room_number,
                f.name AS faculty_name,
                COUNT(a.id) AS present_count
            FROM attendance_sessions sess
            JOIN subjects sub ON sess.subject_id = sub.id
            JOIN classrooms c ON sess.classroom_id = c.id
            JOIN faculty f ON sess.faculty_id = f.id
            LEFT JOIN attendance a ON a.session_id = sess.id
            GROUP BY sess.id, sess.session_date, sess.start_time, sess.end_time, sess.status, sub.name, c.room_number, f.name
            ORDER BY sess.start_time DESC
            LIMIT 5
        `);

        const [device_status] = await db.query(`
            SELECT
                d.id,
                d.mac_address,
                d.status,
                c.room_number,
                c.building
            FROM devices d
            LEFT JOIN classrooms c ON d.classroom_id = c.id
            ORDER BY FIELD(d.status, 'online', 'offline', 'revoked'), d.mac_address
            LIMIT 8
        `);

        const [recent_audit_logs] = await db.query(`
            SELECT a.id, a.action, a.details, a.timestamp, u.email AS user_email
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.timestamp DESC
            LIMIT 5
        `);

        res.json({
            total_students,
            total_teachers,
            total_classrooms,
            total_subjects,
            active_devices,
            active_sessions,
            attendance_today,
            revoked_cards,
            unassigned_cards,
            offline_devices,
            recent_sessions,
            device_status,
            recent_audit_logs,
            system_status: revoked_cards > 0 || offline_devices > 0 ? 'Attention Required' : 'All Systems Operational'
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching admin stats', error: err.message });
    }
};

exports.getRfidCards = async (req, res) => {
    try {
        const [cards] = await db.query(`
            SELECT
                r.id,
                r.uid,
                r.status,
                r.issued_at,
                s.name as student_name,
                s.enrollment_number,
                sec.name AS section_name,
                sec.branch
            FROM rfid_cards r
            LEFT JOIN students s ON r.student_id = s.id
            LEFT JOIN sections sec ON s.section_id = sec.id
            ORDER BY FIELD(r.status, 'active', 'lost', 'revoked'), r.issued_at DESC
        `);
        res.json(cards);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching cards', error: err.message });
    }
};
