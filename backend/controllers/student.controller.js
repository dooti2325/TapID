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
            await connection.query(
                'UPDATE students SET name = ?, enrollment_number = ?, section_id = ? WHERE id = ?',
                [name, enrollment_number, section_id || null, id]
            );
            if (rfid_uid) {
                await connection.query(
                    `INSERT INTO rfid_cards (uid, student_id, status)
                     VALUES (?, ?, 'active')
                     ON DUPLICATE KEY UPDATE student_id = VALUES(student_id), status = 'active'`,
                    [rfid_uid, id]
                );
            }
            await connection.commit();
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
        res.json({ message: 'Student updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating student', error: err.message });
    }
};

exports.deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM students WHERE id=?', [id]);
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting student', error: err.message });
    }
};
