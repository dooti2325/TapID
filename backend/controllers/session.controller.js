const db = require('../config/database');

exports.startSession = async (req, res) => {
    let { timetable_id, subject_id, classroom_id, subject_name, room_number } = req.body;
    
    // faculty_id needs to be retrieved from faculty table using user.id
    try {
        const [faculty] = await db.execute('SELECT id FROM faculty WHERE user_id = ?', [req.user.id]);
        if (faculty.length === 0) return res.status(403).json({ message: 'User is not faculty' });
        const faculty_id = faculty[0].id;

        if (timetable_id && (!subject_id || !classroom_id)) {
            const [tt] = await db.execute('SELECT subject_id, classroom_id FROM timetable WHERE id = ?', [timetable_id]);
            if (tt.length > 0) {
                subject_id = subject_id || tt[0].subject_id;
                classroom_id = classroom_id || tt[0].classroom_id;
            }
        }

        if (!subject_id && subject_name) {
            const cleanSub = subject_name.split(':')[0].trim();
            const [sub] = await db.execute('SELECT id FROM subjects WHERE name LIKE ? OR code = ? LIMIT 1', [`%${cleanSub}%`, cleanSub]);
            if (sub.length > 0) subject_id = sub[0].id;
        }

        if (!classroom_id && room_number) {
            const cleanRoom = room_number.replace('Room', '').trim();
            const [cls] = await db.execute('SELECT id FROM classrooms WHERE room_number = ? OR room_number = ? LIMIT 1', [room_number, cleanRoom]);
            if (cls.length > 0) classroom_id = cls[0].id;
        }

        if (!subject_id || !classroom_id) {
            return res.status(400).json({ message: 'Valid subject and classroom are required to start a session' });
        }

        // Auto-close any previous dangling active sessions in this classroom or by this faculty
        await db.execute(
            'UPDATE attendance_sessions SET status = ?, end_time = NOW() WHERE (faculty_id = ? OR classroom_id = ?) AND status = ?',
            ['completed', faculty_id, classroom_id, 'active']
        );

        const [result] = await db.execute(
            'INSERT INTO attendance_sessions (timetable_id, faculty_id, subject_id, classroom_id, session_date, start_time, status) VALUES (?, ?, ?, ?, CURDATE(), NOW(), ?)',
            [timetable_id || null, faculty_id, subject_id, classroom_id, 'active']
        );
        res.json({ message: 'Session started', session_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.endSession = async (req, res) => {
    const { id } = req.params;
    try {
        const [faculty] = await db.execute('SELECT id FROM faculty WHERE user_id = ?', [req.user.id]);
        if (faculty.length === 0) return res.status(403).json({ message: 'User is not faculty' });
        const faculty_id = faculty[0].id;

        await db.execute(
            'UPDATE attendance_sessions SET end_time = NOW(), status = ? WHERE id = ? AND faculty_id = ?',
            ['completed', id, faculty_id]
        );
        res.json({ message: 'Session ended' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getActiveSession = async (req, res) => {
    try {
        const [faculty] = await db.execute('SELECT id FROM faculty WHERE user_id = ?', [req.user.id]);
        if (faculty.length === 0) return res.json(null);
        const faculty_id = faculty[0].id;

        const [sessions] = await db.execute(
            'SELECT * FROM attendance_sessions WHERE status = ? AND faculty_id = ?',
            ['active', faculty_id]
        );
        if (sessions.length > 0) {
            res.json(sessions[0]);
        } else {
            res.json(null);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getSessionById = async (req, res) => {
    const { id } = req.params;
    try {
        const [sessions] = await db.execute(`
            SELECT s.*, 
                   sub.name AS subject_name, sub.code AS subject_code,
                   c.room_number, c.building,
                   f.name AS faculty_name,
                   sec.name AS section_name, sec.id AS section_id,
                   (SELECT COUNT(*) FROM students st WHERE st.section_id = sec.id) AS enrolled_count
            FROM attendance_sessions s
            JOIN subjects sub ON s.subject_id = sub.id
            JOIN classrooms c ON s.classroom_id = c.id
            JOIN faculty f ON s.faculty_id = f.id
            LEFT JOIN timetable t ON s.timetable_id = t.id
            LEFT JOIN sections sec ON t.section_id = sec.id
            WHERE s.id = ?
        `, [id]);
        if (sessions.length === 0) return res.status(404).json({ message: 'Session not found' });
        res.json(sessions[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
