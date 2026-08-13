const db = require('../config/database');

exports.startSession = async (req, res) => {
    const { timetable_id, subject_id, classroom_id } = req.body;
    
    // faculty_id needs to be retrieved from faculty table using user.id
    try {
        const [faculty] = await db.execute('SELECT id FROM faculty WHERE user_id = ?', [req.user.id]);
        if (faculty.length === 0) return res.status(403).json({ message: 'User is not faculty' });
        const faculty_id = faculty[0].id;

        const [result] = await db.execute(
            'INSERT INTO attendance_sessions (timetable_id, faculty_id, subject_id, classroom_id, session_date, start_time, status) VALUES (?, ?, ?, ?, CURDATE(), NOW(), ?)',
            [timetable_id, faculty_id, subject_id, classroom_id, 'active']
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
