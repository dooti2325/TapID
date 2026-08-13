const db = require('../config/database');

exports.getAllSubjects = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM subjects');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching subjects', error: err.message });
    }
};

exports.addSubject = async (req, res) => {
    try {
        const { code, name, semester } = req.body;
        if (!code || !name || !semester) {
            return res.status(400).json({ message: 'Code, name, and semester are required' });
        }
        
        const [result] = await db.query(
            'INSERT INTO subjects (code, name, semester) VALUES (?, ?, ?)',
            [code, name, semester]
        );
        
        res.status(201).json({ 
            message: 'Subject added successfully', 
            id: result.insertId,
            code, name, semester 
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Subject code already exists' });
        }
        res.status(500).json({ message: 'Error adding subject', error: err.message });
    }
};

exports.updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, name, semester } = req.body;
        
        const [result] = await db.query(
            'UPDATE subjects SET code = ?, name = ?, semester = ? WHERE id = ?',
            [code, name, semester, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        
        res.json({ message: 'Subject updated successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Subject code already exists' });
        }
        res.status(500).json({ message: 'Error updating subject', error: err.message });
    }
};

exports.deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM subjects WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        
        res.json({ message: 'Subject deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting subject', error: err.message });
    }
};
