const db = require('../config/database');

exports.getAllClassrooms = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT c.*, d.status as device_status, d.mac_address as device_mac, d.id as device_id
            FROM classrooms c
            LEFT JOIN devices d ON c.id = d.classroom_id
            ORDER BY c.room_number
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching classrooms', error: err.message });
    }
};

exports.addClassroom = async (req, res) => {
    const { room_number, building } = req.body;
    if (!room_number) return res.status(400).json({ message: 'room_number is required' });
    try {
        const [result] = await db.query(
            'INSERT INTO classrooms (room_number, building) VALUES (?, ?)',
            [room_number, building || null]
        );
        res.status(201).json({ id: result.insertId, room_number, building });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Room number already exists' });
        }
        res.status(500).json({ message: 'Error adding classroom', error: err.message });
    }
};

exports.updateClassroom = async (req, res) => {
    const { id } = req.params;
    const { room_number, building } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE classrooms SET room_number=?, building=? WHERE id=?',
            [room_number, building || null, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Classroom not found' });
        res.json({ message: 'Classroom updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating classroom', error: err.message });
    }
};

exports.deleteClassroom = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM classrooms WHERE id=?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Classroom not found' });
        res.json({ message: 'Classroom deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting classroom', error: err.message });
    }
};
