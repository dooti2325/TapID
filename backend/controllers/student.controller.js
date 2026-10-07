const db = require('../config/database');

exports.getAllStudents = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                s.id,
                s.name,
                s.enrollment_number,
                s.created_at,
                sec.name AS section_name,
                sec.branch,
                sec.semester,
                rc.uid AS rfid_uid,
                rc.status AS rfid_status
            FROM students s
            LEFT JOIN sections sec ON s.section_id = sec.id
            LEFT JOIN rfid_cards rc ON rc.student_id = s.id AND rc.status = 'active'
            ORDER BY s.name
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching students', error: err.message });
    }
};

exports.addStudent = async (req, res) => {
    const { rfid_uid, name, enrollment_number, section_id } = req.body;
    if (!name || !enrollment_number) {
        return res.status(400).json({ message: 'Name and enrollment number are required' });
    }
    try {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.query(
                'INSERT INTO students (name, enrollment_number, section_id) VALUES (?, ?, ?)',
                [name, enrollment_number, section_id || null]
            );
            if (rfid_uid) {
                await connection.query(
                    'INSERT INTO rfid_cards (uid, student_id, status) VALUES (?, ?, ?)',
                    [rfid_uid, result.insertId, 'active']
                );
            }
            await connection.commit();
            res.status(201).json({ id: result.insertId, rfid_uid, name, enrollment_number, section_id });
        } catch (err) {
            await connection.rollback();
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'A student with this enrollment number or RFID UID already exists' });
            }
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        res.status(500).json({ message: 'Error adding student', error: err.message });
    }
};

exports.updateStudent = async (req, res) => {
    const { id } = req.params;
    const { rfid_uid, name, enrollment_number, section_id } = req.body;
    try {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.query(
                'UPDATE students SET name = ?, enrollment_number = ?, section_id = ? WHERE id = ?',
                [name, enrollment_number, section_id || null, id]
            );
            if (result.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Student not found' });
            }
            if (rfid_uid) {
                await connection.query(
                    `INSERT INTO rfid_cards (uid, student_id, status)
                     VALUES (?, ?, 'active')
                     ON DUPLICATE KEY UPDATE student_id = VALUES(student_id), status = 'active'`,
                    [rfid_uid, id]
                );
            }
            await connection.commit();
            res.json({ message: 'Student updated successfully' });
        } catch (err) {
            await connection.rollback();
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Enrollment number or RFID UID already in use' });
            }
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        res.status(500).json({ message: 'Error updating student', error: err.message });
    }
};

exports.deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            // Delete attendance records to satisfy foreign key constraint
            await connection.query('DELETE FROM attendance WHERE student_id = ?', [id]);
            
            // Delete the student
            const [result] = await connection.query('DELETE FROM students WHERE id = ?', [id]);
            
            if (result.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Student not found' });
            }
            
            await connection.commit();
            res.json({ message: 'Student deleted successfully' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        res.status(500).json({ message: 'Error deleting student', error: err.message });
    }
};

exports.getStudentAttendance = async (req, res) => {
    try {
        let studentId = req.params.id;
        // If accessed by logged in student, find studentId by user_id
        if (req.user && req.user.role === 'student') {
            const [students] = await db.query('SELECT id, enrollment_number, name FROM students WHERE user_id = ?', [req.user.id]);
            if (students.length === 0) {
                // If not directly linked by user_id, try matching by email
                const [byEmail] = await db.query('SELECT id, enrollment_number, name FROM students WHERE enrollment_number = ? OR name LIKE ?', [
                    req.user.email.split('@')[0],
                    `%${req.user.name || ''}%`
                ]);
                if (byEmail.length > 0) {
                    studentId = byEmail[0].id;
                } else {
                    return res.status(404).json({ message: 'Student profile not linked to user account' });
                }
            } else {
                studentId = students[0].id;
            }
        }

        const [records] = await db.query(`
            SELECT
                a.id,
                a.timestamp,
                a.status,
                sub.name AS subject_name,
                sub.code AS subject_code,
                c.room_number,
                f.name AS faculty_name
            FROM attendance a
            JOIN attendance_sessions sess ON a.session_id = sess.id
            JOIN subjects sub ON sess.subject_id = sub.id
            LEFT JOIN classrooms c ON sess.classroom_id = c.id
            LEFT JOIN faculty f ON sess.faculty_id = f.id
            WHERE a.student_id = ?
            ORDER BY a.timestamp DESC
        `, [studentId]);

        const [[{ total_classes }]] = await db.query(`
            SELECT COUNT(DISTINCT sess.id) as total_classes
            FROM attendance_sessions sess
            JOIN students s ON s.id = ?
            WHERE sess.section_id = s.section_id OR sess.section_id IS NULL
        `, [studentId]);

        const attended = records.filter(r => r.status === 'present' || r.status === 'late').length;
        const total = Math.max(total_classes || 0, records.length);
        const rate = total > 0 ? parseFloat(((attended / total) * 100).toFixed(1)) : 100.0;

        res.json({
            student_id: studentId,
            total_classes: total,
            attended,
            attendance_rate: rate,
            status: rate >= 75 ? 'Eligible' : rate >= 60 ? 'Warning' : 'Defaulter',
            records
        });
    } catch (err) {
        console.error('Error fetching student attendance:', err);
        res.status(500).json({ message: 'Error fetching attendance', error: err.message });
    }
};
