const db = require('../config/database');

exports.getAllDevices = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT d.id, d.mac_address, d.status, d.classroom_id,
                   c.room_number, c.building
            FROM devices d
            LEFT JOIN classrooms c ON d.classroom_id = c.id
            ORDER BY FIELD(d.status, 'online', 'offline', 'revoked'), d.mac_address
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching devices', error: err.message });
    }
};

exports.addDevice = async (req, res) => {
    const { mac_address, classroom_id } = req.body;
    if (!mac_address) return res.status(400).json({ message: 'mac_address is required' });
    try {
        const [result] = await db.query(
            "INSERT INTO devices (mac_address, classroom_id, status) VALUES (?, ?, 'offline')",
            [mac_address, classroom_id || null]
        );
        res.status(201).json({
            id: result.insertId,
            mac_address,
            classroom_id: classroom_id || null,
            status: 'offline'
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Device with this MAC address already exists' });
        }
        res.status(500).json({ message: 'Error adding device', error: err.message });
    }
};

exports.updateDeviceStatus = async (req, res) => {
    const { mac_address, status } = req.body;
    if (!mac_address || !status) {
        return res.status(400).json({ message: 'mac_address and status are required' });
    }

    const allowedStatuses = ['online', 'offline'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` });
    }

    try {
        const [result] = await db.query(
            "UPDATE devices SET status = ? WHERE mac_address = ? AND status != 'revoked'",
            [status, mac_address]
        );
        if (result && result.affectedRows === 0) {
            const [check] = await db.query('SELECT status FROM devices WHERE mac_address = ?', [mac_address]);
            if (check && check.length > 0 && check[0].status === 'revoked') {
                return res.status(403).json({ message: 'Device is revoked and cannot change status' });
            }
            return res.status(404).json({ message: 'Device not found' });
        }
        res.json({ message: 'Device status updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating device status', error: err.message });
    }
};

exports.deleteDevice = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM devices WHERE id = ? OR mac_address = ?', [id, id]);
        if (result && result.affectedRows === 0) {
            return res.status(404).json({ message: 'Device not found' });
        }
        res.json({ message: 'Device deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting device', error: err.message });
    }
};

exports.assignClassroom = async (req, res) => {
    const { id } = req.params;
    const { classroom_id } = req.body;
    try {
        const [result] = await db.query('UPDATE devices SET classroom_id = ? WHERE id = ?', [classroom_id || null, id]);
        if (result && result.affectedRows === 0) {
            return res.status(404).json({ message: 'Device not found' });
        }
        res.json({ message: 'Classroom assigned successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error assigning classroom', error: err.message });
    }
};
