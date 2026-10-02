const db = require('../config/database');

exports.getTimetable = async (req, res) => {
    try {
        let query = `
            SELECT t.*, s.name as subject_name, s.code as subject_code, sec.name as section_name, c.room_number, f.name as faculty_name 
            FROM timetable t
            JOIN subjects s ON t.subject_id = s.id
            JOIN sections sec ON t.section_id = sec.id
            JOIN classrooms c ON t.classroom_id = c.id
            JOIN faculty f ON t.faculty_id = f.id
        `;
        let params = [];

        if (req.user.role === 'faculty') {
            // If faculty member has specific assigned classes, filter by their user_id
            const [fac] = await db.query('SELECT id FROM faculty WHERE user_id = ?', [req.user.id]);
            if (fac.length > 0) {
                const [facRows] = await db.query(query + ' WHERE t.faculty_id = ? ORDER BY FIELD(day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"), start_time', [fac[0].id]);
                if (facRows.length > 0) {
                    return res.json(facRows);
                }
            }
        }

        query += ` ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), start_time`;

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching timetable', error: err.message });
    }
};

exports.addTimetable = async (req, res) => {
    const { faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time } = req.body;
    if (!faculty_id || !subject_id || !section_id || !classroom_id || !day_of_week || !start_time || !end_time) {
        return res.status(400).json({ message: 'All timetable fields are required' });
    }
    try {
        const [result] = await db.execute(
            'INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time]
        );
        res.status(201).json({ message: 'Timetable entry added', id: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Timetable slot conflict — this slot already exists' });
        }
        res.status(500).json({ message: 'Error adding timetable entry', error: err.message });
    }
};

exports.deleteTimetable = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM timetable WHERE id=?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Timetable entry not found' });
        res.json({ message: 'Timetable entry deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting timetable entry', error: err.message });
    }
};
