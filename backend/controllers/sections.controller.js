const db = require('../config/database');

const DEFAULT_SECTIONS = [
    { id: 1, name: 'Section G', branch: 'Computer Science', semester: 5, student_count: 58 },
    { id: 2, name: 'G1 (Roll 1-33)', branch: 'Computer Science', semester: 5, student_count: 33 },
    { id: 3, name: 'G2 (Roll 34+)', branch: 'Computer Science', semester: 5, student_count: 25 },
    { id: 4, name: 'CS-Core', branch: 'Computer Science', semester: 5, student_count: 58 },
];
let inMemorySections = [...DEFAULT_SECTIONS];

exports.getAllSections = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM sections ORDER BY branch, semester, name');
        if (Array.isArray(rows) && rows.length > 0) {
            return res.json(rows);
        }
        res.json(inMemorySections);
    } catch (err) {
        res.json(inMemorySections);
    }
};

exports.addSection = async (req, res) => {
    const { name, branch, semester } = req.body;
    if (!name || !branch || !semester) {
        return res.status(400).json({ message: 'name, branch, and semester are required' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO sections (name, branch, semester) VALUES (?, ?, ?)',
            [name, branch, Number(semester)]
        );
        const newSec = { id: result.insertId, name, branch, semester: Number(semester), student_count: 0 };
        inMemorySections.push(newSec);
        res.status(201).json(newSec);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Section already exists' });
        }
        const maxId = inMemorySections.reduce((max, s) => Math.max(max, Number(s.id) || 0), 0);
        const newSec = { id: maxId + 1, name, branch, semester: Number(semester), student_count: 0 };
        inMemorySections.push(newSec);
        res.status(201).json(newSec);
    }
};

exports.updateSection = async (req, res) => {
    const { id } = req.params;
    const { name, branch, semester } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE sections SET name=?, branch=?, semester=? WHERE id=?',
            [name, branch, Number(semester), id]
        );
        const sec = inMemorySections.find(s => String(s.id) === String(id));
        if (sec) {
            if (name) sec.name = name;
            if (branch) sec.branch = branch;
            if (semester) sec.semester = Number(semester);
        }
        if (result && result.affectedRows === 0 && !sec) return res.status(404).json({ message: 'Section not found' });
        res.json({ message: 'Section updated successfully' });
    } catch (err) {
        const sec = inMemorySections.find(s => String(s.id) === String(id));
        if (sec) {
            if (name) sec.name = name;
            if (branch) sec.branch = branch;
            if (semester) sec.semester = Number(semester);
        }
        res.json({ message: 'Section updated successfully' });
    }
};

exports.deleteSection = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM sections WHERE id=?', [id]);
        inMemorySections = inMemorySections.filter(s => String(s.id) !== String(id));
        if (result && result.affectedRows === 0) return res.status(404).json({ message: 'Section not found' });
        res.json({ message: 'Section deleted successfully' });
    } catch (err) {
        inMemorySections = inMemorySections.filter(s => String(s.id) !== String(id));
        res.json({ message: 'Section deleted successfully' });
    }
};
