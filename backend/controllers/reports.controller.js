const db = require('../config/database');

exports.getAttendanceReport = async (req, res) => {
    const { subject_id, date, department } = req.query;
    try {
        let query = `
            SELECT
                a.id AS attendance_id,
                a.timestamp as time,
                s.id AS student_id,
                s.name,
                s.enrollment_number,
                sec.branch,
                sec.name AS section_name,
                sub.id AS subject_id,
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

        if (subject_id && subject_id !== 'All Subjects') {
            query += ` AND (sess.subject_id = ? OR sub.code = ?)`;
            params.push(subject_id, subject_id);
        }
        if (date) {
            query += ` AND DATE(sess.start_time) = ?`;
            params.push(date);
        }
        if (department && department !== 'All Sections') {
            query += ` AND (sec.branch = ? OR sec.name LIKE ?)`;
            params.push(department, `%${department}%`);
        }

        query += ` ORDER BY a.timestamp DESC`;

        const [rows] = await db.query(query, params);

        // Fetch total students for the selected department/branch
        let totalQuery = `SELECT COUNT(*) as total FROM students WHERE 1=1`;
        const totalParams = [];
        if (department && department !== 'All Sections') {
            totalQuery += ` AND section_id IN (SELECT id FROM sections WHERE branch = ? OR name LIKE ?)`;
            totalParams.push(department, `%${department}%`);
        }
        const [[{ total }]] = await db.query(totalQuery, totalParams);

        // Count total sessions held
        let sessQuery = `SELECT COUNT(*) as total_sessions FROM attendance_sessions WHERE 1=1`;
        const sessParams = [];
        if (subject_id && subject_id !== 'All Subjects') {
            sessQuery += ` AND (subject_id = ? OR subject_id IN (SELECT id FROM subjects WHERE code = ?))`;
            sessParams.push(subject_id, subject_id);
        }
        const [[{ total_sessions }]] = await db.query(sessQuery, sessParams);

        // Calculate student summaries
        let stuQuery = `
            SELECT 
                s.id,
                s.enrollment_number AS roll_no,
                s.name,
                sec.name AS section_name,
                COUNT(DISTINCT a.session_id) AS attended
            FROM students s
            LEFT JOIN sections sec ON s.section_id = sec.id
            LEFT JOIN attendance a ON a.student_id = s.id
                ${subject_id && subject_id !== 'All Subjects' ? 'AND a.session_id IN (SELECT id FROM attendance_sessions WHERE subject_id = ? OR subject_id IN (SELECT id FROM subjects WHERE code = ?))' : ''}
            WHERE 1=1
                ${department && department !== 'All Sections' ? 'AND (sec.branch = ? OR sec.name LIKE ?)' : ''}
            GROUP BY s.id, s.enrollment_number, s.name, sec.name
            ORDER BY s.enrollment_number ASC
        `;
        const stuParams = [];
        if (subject_id && subject_id !== 'All Subjects') {
            stuParams.push(subject_id, subject_id);
        }
        if (department && department !== 'All Sections') {
            stuParams.push(department, `%${department}%`);
        }
        const [studentRows] = await db.query(stuQuery, stuParams);

        const studentSummaries = studentRows.map(stu => {
            const attended = stu.attended || 0;
            const pct = total_sessions > 0 ? parseFloat(((attended / total_sessions) * 100).toFixed(1)) : 100.0;
            const status = pct >= 75 ? 'Eligible' : pct >= 60 ? 'Warning' : 'Defaulter';
            return {
                id: stu.id,
                roll_no: stu.roll_no,
                name: stu.name,
                section_name: stu.section_name,
                total_classes: total_sessions,
                attended,
                percentage: pct,
                status
            };
        });

        const distinctPresent = new Set(rows.map(r => r.enrollment_number)).size;
        const defaultersCount = total_sessions > 0 ? studentSummaries.filter(s => s.status === 'Defaulter').length : 0;
        const avgPct = studentSummaries.length > 0 
            ? parseFloat((studentSummaries.reduce((acc, s) => acc + s.percentage, 0) / studentSummaries.length).toFixed(1))
            : 0;

        res.json({
            records: rows,
            studentSummaries,
            summary: {
                totalStudents: total,
                presentToday: distinctPresent,
                absentToday: Math.max(0, total - distinctPresent),
                totalClassesHeld: total_sessions,
                averageAttendance: avgPct,
                defaultersCount
            }
        });

    } catch (err) {
        console.error('Error fetching reports:', err);
        res.status(500).json({ message: 'Error fetching reports', error: err.message });
    }
};
