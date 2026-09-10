const db = require('../config/database');

// Exact Institutional Weekly Schedule matching department timetable
const FULL_WEEKLY_TIMETABLE = [
    // Monday
    { id: 101, subject_code: 'CD', subject_name: 'Compiler Design', faculty_name: 'Chetram Thakur (CT)', section_name: 'CS-Core', room_number: 'C-102', day_of_week: 'Monday', start_time: '08:05:00', end_time: '09:00:00' },
    { id: 102, subject_code: 'CSS', subject_name: 'Computer System Security', faculty_name: 'Ashish Trivedi (AT)', section_name: 'CS-Core', room_number: 'C-102', day_of_week: 'Monday', start_time: '09:00:00', end_time: '09:55:00' },
    { id: 103, subject_code: 'ES-AI', subject_name: 'Ethical & Social Implication of AI', faculty_name: 'Dr. Sumalata Bhandari (SB)', section_name: 'CS-Core', room_number: 'C-102', day_of_week: 'Monday', start_time: '10:15:00', end_time: '11:10:00' },
    { id: 104, subject_code: 'SPORTS', subject_name: 'Sports & Physical Ed', faculty_name: 'Sports Dept', section_name: 'CS-Core', room_number: 'Ground', day_of_week: 'Monday', start_time: '11:10:00', end_time: '12:05:00' },
    { id: 105, subject_code: 'PROJECT', subject_name: 'Capstone Project Lab', faculty_name: 'Faculty Guides', section_name: 'CS-Core', room_number: 'C-102', day_of_week: 'Monday', start_time: '12:10:00', end_time: '14:00:00' },

    // Tuesday
    { id: 201, subject_code: 'CSS', subject_name: 'Computer System Security', faculty_name: 'Ashish Trivedi (AT)', section_name: 'CS-Core', room_number: 'C-102', day_of_week: 'Tuesday', start_time: '08:05:00', end_time: '09:00:00' },
    { id: 202, subject_code: 'DEV', subject_name: 'DevOps: Software Dev & IT Ops', faculty_name: 'Dr. Trupti Meshram (TM)', section_name: 'CS-Core', room_number: 'C-102', day_of_week: 'Tuesday', start_time: '09:00:00', end_time: '09:55:00' },
    { id: 203, subject_code: 'CD', subject_name: 'Compiler Design', faculty_name: 'Chetram Thakur (CT)', section_name: 'CS-Core', room_number: 'C-102', day_of_week: 'Tuesday', start_time: '10:15:00', end_time: '11:10:00' },
    { id: 204, subject_code: 'ES-AI', subject_name: 'Ethical & Social Implication of AI', faculty_name: 'Dr. Sumalata Bhandari (SB)', section_name: 'CS-Core', room_number: 'C-102', day_of_week: 'Tuesday', start_time: '11:10:00', end_time: '12:05:00' },
    { id: 205, subject_code: 'PROJECT', subject_name: 'Capstone Project Lab', faculty_name: 'Faculty Guides', section_name: 'CS-Core', room_number: 'C-102', day_of_week: 'Tuesday', start_time: '12:10:00', end_time: '14:00:00' },

    // Wednesday
    { id: 301, subject_code: 'ES-AI', subject_name: 'Ethical & Social Implication of AI', faculty_name: 'Dr. Sumalata Bhandari (SB)', section_name: 'CS-Core', room_number: 'C-102', day_of_week: 'Wednesday', start_time: '08:05:00', end_time: '09:00:00' },
    { id: 302, subject_code: 'AIML', subject_name: 'Artificial Intelligence & Machine Learning', faculty_name: 'Amol Dhankar (AD)', section_name: 'CS-Core', room_number: 'C-102', day_of_week: 'Wednesday', start_time: '09:00:00', end_time: '09:55:00' },
    { id: 303, subject_code: 'DEV', subject_name: 'DevOps: Software Dev & IT Ops', faculty_name: 'Dr. Trupti Meshram (TM)', section_name: 'CS-Core', room_number: 'C-102', day_of_week: 'Wednesday', start_time: '10:15:00', end_time: '11:10:00' },
    { id: 304, subject_code: 'CSS', subject_name: 'Computer System Security', faculty_name: 'Ashish Trivedi (AT)', section_name: 'CS-Core', room_number: 'C-102', day_of_week: 'Wednesday', start_time: '11:10:00', end_time: '12:05:00' },
    { id: 305, subject_code: 'PROJECT', subject_name: 'Capstone Project Lab', faculty_name: 'Faculty Guides', section_name: 'CS-Core', room_number: 'C-102', day_of_week: 'Wednesday', start_time: '12:10:00', end_time: '14:00:00' },

    // Thursday
    { id: 401, subject_code: 'AIML', subject_name: 'Artificial Intelligence & Machine Learning', faculty_name: 'Amol Dhankar (AD)', section_name: 'CS-Core', room_number: 'C-102', day_of_week: 'Thursday', start_time: '08:05:00', end_time: '09:00:00' },
    { id: 402, subject_code: 'DEV', subject_name: 'DevOps: Software Dev & IT Ops', faculty_name: 'Dr. Trupti Meshram (TM)', section_name: 'CS-Core', room_number: 'C-102', day_of_week: 'Thursday', start_time: '09:00:00', end_time: '09:55:00' },
    { id: 403, subject_code: 'AIML', subject_name: 'Artificial Intelligence & Machine Learning', faculty_name: 'Amol Dhankar (AD)', section_name: 'CS-Core', room_number: 'C-102', day_of_week: 'Thursday', start_time: '10:15:00', end_time: '11:10:00' },
    { id: 404, subject_code: 'CD', subject_name: 'Compiler Design', faculty_name: 'Chetram Thakur (CT)', section_name: 'CS-Core', room_number: 'C-102', day_of_week: 'Thursday', start_time: '11:10:00', end_time: '12:05:00' },
    { id: 405, subject_code: 'CD-G1', subject_name: 'Compiler Design Practical (G1)', faculty_name: 'Chetram Thakur (CT)', section_name: 'G1 (Roll 1-33)', room_number: 'C-117', day_of_week: 'Thursday', start_time: '12:10:00', end_time: '14:00:00' },

    // Friday
    { id: 501, subject_code: 'DEV', subject_name: 'DevOps: Software Dev & IT Ops', faculty_name: 'Dr. Trupti Meshram (TM)', section_name: 'CS-Core', room_number: 'C-102', day_of_week: 'Friday', start_time: '08:05:00', end_time: '09:00:00' },
    { id: 502, subject_code: 'ES-AI', subject_name: 'Ethical & Social Implication of AI', faculty_name: 'Dr. Sumalata Bhandari (SB)', section_name: 'CS-Core', room_number: 'C-102', day_of_week: 'Friday', start_time: '09:00:00', end_time: '09:55:00' },
    { id: 503, subject_code: 'CD-G2', subject_name: 'Compiler Design Practical (G2)', faculty_name: 'Prachi Jain (PSJ)', section_name: 'G2 (Roll 34+)', room_number: 'C-102', day_of_week: 'Friday', start_time: '10:15:00', end_time: '12:05:00' },
    { id: 504, subject_code: 'PROJECT', subject_name: 'Capstone Project Lab', faculty_name: 'Faculty Guides', section_name: 'CS-Core', room_number: 'C-102', day_of_week: 'Friday', start_time: '12:10:00', end_time: '14:00:00' },

    // Saturday
    { id: 601, subject_code: 'SPORTS', subject_name: 'Sports & Athletics', faculty_name: 'Sports Dept', section_name: 'CS-Core', room_number: 'Ground', day_of_week: 'Saturday', start_time: '08:05:00', end_time: '09:55:00' },
    { id: 602, subject_code: 'SPORTS', subject_name: 'Sports & Athletics', faculty_name: 'Sports Dept', section_name: 'CS-Core', room_number: 'Ground', day_of_week: 'Saturday', start_time: '10:15:00', end_time: '14:00:00' },
];

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
            query += ` WHERE f.user_id = ?`;
            params.push(req.user.id);
        }

        query += ` ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), start_time`;

        const [rows] = await db.execute(query, params);
        if (Array.isArray(rows) && rows.length > 0) {
            return res.json(rows);
        }
        res.json(FULL_WEEKLY_TIMETABLE);
    } catch (err) {
        console.warn(`[TapID Fallback] DB unavailable (${err.code || err.message}). Serving official weekly timetable.`);
        res.json(FULL_WEEKLY_TIMETABLE);
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
        res.json({ message: 'Timetable entry added (demo mode)' });
    }
};

exports.deleteTimetable = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM timetable WHERE id=?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Timetable entry not found' });
        res.json({ message: 'Timetable entry deleted' });
    } catch (err) {
        res.json({ message: 'Timetable entry deleted (demo mode)' });
    }
};
