const db = require('../config/database');

exports.getAllDevices = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT d.*, c.room_number 
            FROM devices d 
            LEFT JOIN classrooms c ON d.classroom_id = c.id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching devices', error: err.message });
    }
};

exports.updateDeviceStatus = async (req, res) => {
    const { mac_address, status } = req.body;
    try {
        await db.query('UPDATE devices SET status=? WHERE mac_address=?', [status, mac_address]);
        res.json({ message: 'Device status updated' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating device status', error: err.message });
    }
};
