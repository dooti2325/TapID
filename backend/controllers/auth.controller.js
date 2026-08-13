const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../utils/jwt');

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

        const user = users[0];
        const validPass = await bcrypt.compare(password, user.password_hash);
        if (!validPass) return res.status(400).json({ message: 'Invalid credentials' });

        let profile = {};
        if (user.role === 'admin' || user.role === 'faculty') {
            const [faculty] = await db.execute('SELECT * FROM faculty WHERE user_id = ?', [user.id]);
            if (faculty.length > 0) profile = faculty[0];
        } else if (user.role === 'student') {
            const [student] = await db.execute('SELECT * FROM students WHERE user_id = ?', [user.id]);
            if (student.length > 0) profile = student[0];
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, getJwtSecret(), { expiresIn: '1d' });
        const userName = profile.name || user.email.split('@')[0];
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: userName,
                profile
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const [users] = await db.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const validPass = await bcrypt.compare(currentPassword, users[0].password_hash);
        if (!validPass) return res.status(400).json({ message: 'Incorrect current password' });

        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating password', error: err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        let profile = { email: req.user.email, role };

        if (role === 'admin' || role === 'faculty') {
            const [faculty] = await db.query('SELECT * FROM faculty WHERE user_id = ?', [userId]);
            if (faculty.length > 0) profile = { ...profile, ...faculty[0] };
        } else if (role === 'student') {
            const [student] = await db.query('SELECT * FROM students WHERE user_id = ?', [userId]);
            if (student.length > 0) profile = { ...profile, ...student[0] };
        }

        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching profile', error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        
        if (role === 'faculty' || role === 'admin') {
            const { name, department, phone, address } = req.body;
            await db.query(
                'UPDATE faculty SET name = ?, department = ?, phone = ?, address = ? WHERE user_id = ?',
                [name, department, phone, address, userId]
            );
        } else if (role === 'student') {
            const { name, phone, address } = req.body;
            // Assuming students have these fields, otherwise just name
            await db.query(
                'UPDATE students SET name = ? WHERE user_id = ?',
                [name, userId]
            );
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating profile', error: err.message });
    }
};
