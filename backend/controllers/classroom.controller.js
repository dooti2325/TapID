const db = require('../config/database');

exports.getAllClassrooms = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT c.*, d.status as device_status, d.mac_address as device_id
            FROM classrooms c 
            LEFT JOIN devices d ON c.id = d.classroom_id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching classrooms', error: err.message });
    }
};
