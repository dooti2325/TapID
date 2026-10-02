const db = require('../config/database');

exports.getAllSections = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.*, COUNT(st.id) AS student_count
            FROM sections s
            LEFT JOIN students st ON st.section_id = s.id
            GROUP BY s.id
            ORDER BY s.branch, s.semester, s.name
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching sections', error: err.message });
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
        res.status(201).json({ id: result.insertId, name, branch, semester: Number(semester), student_count: 0 });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Section already exists' });
        }
        res.status(500).json({ message: 'Error adding section', error: err.message });
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
        if (result && result.affectedRows === 0) return res.status(404).json({ message: 'Section not found' });
        res.json({ message: 'Section updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating section', error: err.message });
    }
};

exports.deleteSection = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM sections WHERE id=?', [id]);
        if (result && result.affectedRows === 0) return res.status(404).json({ message: 'Section not found' });
        res.json({ message: 'Section deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting section', error: err.message });
    }
};
