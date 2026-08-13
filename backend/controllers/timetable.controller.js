const db = require('../config/database');

exports.getTimetable = async (req, res) => {
    try {
        let query = `
            SELECT t.*, s.name as subject_name, sec.name as section_name, c.room_number, f.name as faculty_name 
            FROM timetable t
            JOIN subjects s ON t.subject_id = s.id
            JOIN sections sec ON t.section_id = sec.id
            JOIN classrooms c ON t.classroom_id = c.id
            JOIN faculty f ON t.faculty_id = f.id
        `;
        let params = [];

        // If faculty, show their timetable
        if (req.user.role === 'faculty') {
            query += ` WHERE f.user_id = ?`;
            params.push(req.user.id);
        }

        query += ` ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), start_time`;

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addTimetable = async (req, res) => {
    const { faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time } = req.body;
    try {
        await db.execute(
            'INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time]
        );
        res.json({ message: 'Timetable entry added' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Timetable slot conflict — this slot already exists' });
        }
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteTimetable = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM timetable WHERE id=?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Timetable entry not found' });
        res.json({ message: 'Timetable entry deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

