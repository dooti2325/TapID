const db = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const DEFAULT_FACULTY = [
    { id: 10, name: 'Ashish Trivedi (AT)', email: 'ashish.trivedi@tapid.edu', phone: '+91 98765 43221', department: 'Computer Science & Engineering', role: 'faculty', subjects: 'CSS' },
    { id: 11, name: 'Chetram Thakur (CT)', email: 'chetram.thakur@tapid.edu', phone: '+91 98765 43222', department: 'Computer Science & Engineering', role: 'faculty', subjects: 'CD' },
    { id: 12, name: 'Dr. Sumalata Bhandari (SB)', email: 'sumalata.bhandari@tapid.edu', phone: '+91 98765 43223', department: 'Computer Science & Engineering', role: 'faculty', subjects: 'ES-AI' },
    { id: 13, name: 'Dr. Trupti Meshram (TM)', email: 'trupti.meshram@tapid.edu', phone: '+91 98765 43224', department: 'Computer Science & Engineering', role: 'faculty', subjects: 'DEV' },
    { id: 14, name: 'Amol Dhankar (AD)', email: 'amol.dhankar@tapid.edu', phone: '+91 98765 43225', department: 'Computer Science & Engineering', role: 'faculty', subjects: 'AIML' },
    { id: 15, name: 'Prachi Jain (PSJ)', email: 'prachi.jain@tapid.edu', phone: '+91 98765 43226', department: 'Computer Science & Engineering', role: 'faculty', subjects: 'CD Lab (G2)' },
];

let inMemoryFaculty = [...DEFAULT_FACULTY];

exports.getAllFaculty = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT f.id, f.name, u.email, f.phone, f.department, u.role, u.created_at
            FROM faculty f
            JOIN users u ON f.user_id = u.id
            ORDER BY f.name
        `);
        if (Array.isArray(rows) && rows.length > 0) {
            return res.json(rows);
        }
        res.json(inMemoryFaculty);
    } catch (err) {
        res.json(inMemoryFaculty);
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
            const effectivePassword = password && password.length >= 8 
                ? password 
                : `${crypto.randomBytes(9).toString('base64').replace(/[^a-zA-Z0-9]/g, 'A')}!9`;
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
            const newFac = {
                id: facultyResult.insertId,
                user_id: userResult.insertId,
                name,
                email,
                phone: phone || '',
                department: department || 'General',
                role: 'faculty',
                temp_password: !password ? effectivePassword : undefined
            };
            inMemoryFaculty.push(newFac);
            res.status(201).json(newFac);
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
        const maxId = inMemoryFaculty.reduce((max, f) => Math.max(max, Number(f.id) || 0), 0);
        const newFac = {
            id: maxId + 1,
            user_id: maxId + 1,
            name,
            email,
            phone: phone || '',
            department: department || 'General',
            role: 'faculty',
            temp_password: password || 'Faculty@123!'
        };
        inMemoryFaculty.push(newFac);
        res.status(201).json(newFac);
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
            const fac = inMemoryFaculty.find(f => String(f.id) === String(id));
            if (fac) {
                if (name) fac.name = name;
                if (email) fac.email = email;
                if (phone) fac.phone = phone;
                if (department) fac.department = department;
            }
            res.json({ message: 'Faculty updated successfully' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        const fac = inMemoryFaculty.find(f => String(f.id) === String(id));
        if (fac) {
            if (name) fac.name = name;
            if (email) fac.email = email;
            if (phone) fac.phone = phone;
            if (department) fac.department = department;
        }
        res.json({ message: 'Faculty updated successfully' });
    }
};

exports.deleteFaculty = async (req, res) => {
    const { id } = req.params;
    try {
        const [[faculty]] = await db.query('SELECT user_id FROM faculty WHERE id = ?', [id]);
        if (!faculty) {
            inMemoryFaculty = inMemoryFaculty.filter(f => String(f.id) !== String(id));
            return res.json({ message: 'Faculty deleted successfully' });
        }
        await db.query('DELETE FROM users WHERE id = ?', [faculty.user_id]);
        inMemoryFaculty = inMemoryFaculty.filter(f => String(f.id) !== String(id));
        res.json({ message: 'Faculty deleted successfully' });
    } catch (err) {
        inMemoryFaculty = inMemoryFaculty.filter(f => String(f.id) !== String(id));
        res.json({ message: 'Faculty deleted successfully' });
    }
};
