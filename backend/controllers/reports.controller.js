const db = require('../config/database');

exports.getAttendanceReport = async (req, res) => {
    const { subject_id, date, department } = req.query;
    try {
        let query = `
            SELECT
                a.timestamp as time,
                s.name,
                s.enrollment_number,
                sec.branch,
                sec.name AS section_name,
                sub.name AS subject_name,
                a.status
            FROM attendance a
            JOIN attendance_sessions sess ON a.session_id = sess.id
            JOIN students s ON a.student_id = s.id
            LEFT JOIN sections sec ON s.section_id = sec.id
            JOIN subjects sub ON sess.subject_id = sub.id
            WHERE 1=1
        `;
        const params = [];

        if (subject_id) {
            query += ` AND sess.subject_id = ?`;
            params.push(subject_id);
        }
        if (date) {
            query += ` AND DATE(sess.start_time) = ?`;
            params.push(date);
        }
        if (department) {
            query += ` AND sec.branch = ?`;
            params.push(department);
        }

        const [rows] = await db.query(query, params);

        // Fetch total students for the selected department/branch
        let totalQuery = `SELECT COUNT(*) as total FROM students WHERE 1=1`;
        const totalParams = [];
        if (department) {
            totalQuery += ` AND section_id IN (SELECT id FROM sections WHERE branch = ?)`;
            totalParams.push(department);
        }
        const [[{ total }]] = await db.query(totalQuery, totalParams);

        res.json({
            records: rows,
            summary: {
                totalStudents: total,
                present: rows.length,
                absent: total - rows.length
            }
        });

    } catch (err) {
        res.status(500).json({ message: 'Error fetching reports', error: err.message });
    }
};
