const db = require('../config/database');
const bcrypt = require('bcryptjs');

exports.getAllFaculty = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT f.id, f.name, u.email, f.phone, f.department, u.role, u.created_at
            FROM faculty f
            JOIN users u ON f.user_id = u.id
            ORDER BY f.name
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching faculty', error: err.message });
    }
};

exports.addFaculty = async (req, res) => {
    const { name, email, phone, department, password } = req.body;
    if (!name || !email) {
        return res.status(400).json({ message: 'name and email are required' });
    }
    try {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const effectivePassword = password && password.length >= 8 ? password : 'TapID@2026';
            const hashedPassword = await bcrypt.hash(effectivePassword, 12);
            const [userResult] = await connection.query(
                'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
                [email, hashedPassword, 'faculty']
            );
            const [facultyResult] = await connection.query(
                'INSERT INTO faculty (user_id, name, phone, department) VALUES (?, ?, ?, ?)',
                [userResult.insertId, name, phone || null, department || null]
            );
            await connection.commit();
            res.status(201).json({ id: facultyResult.insertId, user_id: userResult.insertId, name, email, role: 'faculty', temp_password: !password ? effectivePassword : undefined });
        } catch (err) {
            await connection.rollback();
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Email already exists' });
            }
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        res.status(500).json({ message: 'Error adding faculty', error: err.message });
    }
};

exports.updateFaculty = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, department } = req.body;
    try {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const [[faculty]] = await connection.query('SELECT user_id FROM faculty WHERE id = ?', [id]);
            if (!faculty) {
                await connection.rollback();
                return res.status(404).json({ message: 'Faculty not found' });
            }
            await connection.query(
                'UPDATE faculty SET name = ?, phone = ?, department = ?, address = ? WHERE id = ?',
                [name, phone || null, department || null, req.body.address || null, id]
            );
            if (email) {
                await connection.query('UPDATE users SET email = ? WHERE id = ?', [email, faculty.user_id]);
            }
            await connection.commit();
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
        res.json({ message: 'Faculty updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating faculty', error: err.message });
    }
};

exports.deleteFaculty = async (req, res) => {
    const { id } = req.params;
    try {
        const [[faculty]] = await db.query('SELECT user_id FROM faculty WHERE id = ?', [id]);
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
        await db.query('DELETE FROM users WHERE id = ?', [faculty.user_id]);
        res.json({ message: 'Faculty deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting faculty', error: err.message });
    }
};
