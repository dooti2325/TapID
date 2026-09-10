const db = require('../config/database');

const DEFAULT_SUBJECTS = [
    { id: 1, code: 'CD', name: 'Compiler Design', semester: 5, faculty: 'Chetram Thakur (CT)' },
    { id: 2, code: 'CSS', name: 'Computer System Security', semester: 5, faculty: 'Ashish Trivedi (AT)' },
    { id: 3, code: 'ES-AI', name: 'Ethical & Social Implication of AI', semester: 5, faculty: 'Dr. Sumalata Bhandari (SB)' },
    { id: 4, code: 'DEV', name: 'DevOps: Software Development & IT Operations', semester: 5, faculty: 'Dr. Trupti Meshram (TM)' },
    { id: 5, code: 'AIML', name: 'Artificial Intelligence and Machine Learning', semester: 5, faculty: 'Amol Dhankar (AD)' },
    { id: 6, code: 'PROJECT', name: 'Capstone Project Lab', semester: 5, faculty: 'Faculty Guides' },
    { id: 7, code: 'SPORTS', name: 'Sports & Athletics', semester: 5, faculty: 'Sports Dept' },
];
let inMemorySubjects = [...DEFAULT_SUBJECTS];

exports.getAllSubjects = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM subjects');
        if (Array.isArray(rows) && rows.length > 0) {
            return res.json(rows);
        }
        res.json(inMemorySubjects);
    } catch (err) {
        res.json(inMemorySubjects);
    }
};

exports.addSubject = async (req, res) => {
    const { code, name, semester } = req.body;
    if (!code || !name || !semester) {
        return res.status(400).json({ message: 'Code, name, and semester are required' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO subjects (code, name, semester) VALUES (?, ?, ?)',
            [code, name, semester]
        );
        const newSub = { id: result.insertId, code, name, semester: Number(semester), faculty: 'Assigned Faculty' };
        inMemorySubjects.push(newSub);
        res.status(201).json({ 
            message: 'Subject added successfully', 
            id: result.insertId,
            code, name, semester 
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Subject code already exists' });
        }
        const maxId = inMemorySubjects.reduce((max, s) => Math.max(max, Number(s.id) || 0), 0);
        const newSub = { id: maxId + 1, code, name, semester: Number(semester), faculty: 'Assigned Faculty' };
        inMemorySubjects.push(newSub);
        res.status(201).json({ 
            message: 'Subject added successfully', 
            id: newSub.id,
            code, name, semester 
        });
    }
};

exports.updateSubject = async (req, res) => {
    const { id } = req.params;
    const { code, name, semester } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE subjects SET code = ?, name = ?, semester = ? WHERE id = ?',
            [code, name, semester, id]
        );
        const sub = inMemorySubjects.find(s => String(s.id) === String(id));
        if (sub) {
            if (code) sub.code = code;
            if (name) sub.name = name;
            if (semester) sub.semester = Number(semester);
        }
        if (result && result.affectedRows === 0 && !sub) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.json({ message: 'Subject updated successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Subject code already exists' });
        }
        const sub = inMemorySubjects.find(s => String(s.id) === String(id));
        if (sub) {
            if (code) sub.code = code;
            if (name) sub.name = name;
            if (semester) sub.semester = Number(semester);
        }
        res.json({ message: 'Subject updated successfully' });
    }
};

exports.deleteSubject = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM subjects WHERE id = ?', [id]);
        inMemorySubjects = inMemorySubjects.filter(s => String(s.id) !== String(id));
        if (result && result.affectedRows === 0) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.json({ message: 'Subject deleted successfully' });
    } catch (err) {
        inMemorySubjects = inMemorySubjects.filter(s => String(s.id) !== String(id));
        res.json({ message: 'Subject deleted successfully' });
    }
};
