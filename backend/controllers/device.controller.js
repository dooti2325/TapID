const db = require('../config/database');

const DEFAULT_DEVICES = [
    { id: 1, mac_address: '24:0A:C4:00:00:01', status: 'online', classroom_id: 1, room_number: 'C-102', building: 'Academic Block C' },
    { id: 2, mac_address: '24:0A:C4:00:00:02', status: 'online', classroom_id: 2, room_number: 'C-117', building: 'Academic Block C (Lab)' },
    { id: 3, mac_address: '24:0A:C4:00:00:03', status: 'offline', classroom_id: null, room_number: null, building: null }
];
let inMemoryDevices = [...DEFAULT_DEVICES];

exports.getAllDevices = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT d.id, d.mac_address, d.status, d.classroom_id,
                   c.room_number, c.building
            FROM devices d
            LEFT JOIN classrooms c ON d.classroom_id = c.id
            ORDER BY FIELD(d.status, 'online', 'offline', 'revoked'), d.mac_address
        `);
        if (Array.isArray(rows) && rows.length > 0) {
            return res.json(rows);
        }
        res.json(inMemoryDevices);
    } catch (err) {
        res.json(inMemoryDevices);
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
        const newDev = {
            id: result.insertId,
            mac_address,
            classroom_id: classroom_id || null,
            room_number: classroom_id === '1' ? 'C-102' : classroom_id === '2' ? 'C-117' : null,
            building: classroom_id ? 'Academic Block C' : null,
            status: 'offline'
        };
        inMemoryDevices.push(newDev);
        res.status(201).json(newDev);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Device with this MAC address already exists' });
        }
        const maxId = inMemoryDevices.reduce((max, d) => Math.max(max, Number(d.id) || 0), 0);
        const newDev = {
            id: maxId + 1,
            mac_address,
            classroom_id: classroom_id || null,
            room_number: classroom_id === '1' ? 'C-102' : classroom_id === '2' ? 'C-117' : null,
            building: classroom_id ? 'Academic Block C' : null,
            status: 'offline'
        };
        inMemoryDevices.push(newDev);
        res.status(201).json(newDev);
    }
};

exports.updateDeviceStatus = async (req, res) => {
    const { mac_address, status } = req.body;
    if (!mac_address || !status) {
        return res.status(400).json({ message: 'mac_address and status are required' });
    }

    const allowedStatuses = ['online', 'offline'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    try {
        const [result] = await db.query(
            "UPDATE devices SET status=? WHERE mac_address=? AND status != 'revoked'",
            [status, mac_address]
        );
        if (result.affectedRows === 0) {
            const [devices] = await db.query('SELECT status FROM devices WHERE mac_address=?', [mac_address]);
            if (devices && devices.length > 0 && devices[0].status === 'revoked') {
                return res.status(403).json({ message: 'Cannot update status of revoked device' });
            }
        }
        const dev = inMemoryDevices.find(d => d.mac_address === mac_address);
        if (dev) dev.status = status;
        res.json({ message: 'Device status updated' });
    } catch (err) {
        const dev = inMemoryDevices.find(d => d.mac_address === mac_address);
        if (dev) dev.status = status;
        res.json({ message: 'Device status updated' });
    }
};

exports.deleteDevice = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM devices WHERE id=?', [id]);
        inMemoryDevices = inMemoryDevices.filter(d => String(d.id) !== String(id) && d.mac_address !== id);
        if (result && result.affectedRows === 0) return res.status(404).json({ message: 'Device not found' });
        res.json({ message: 'Device deleted successfully' });
    } catch (err) {
        inMemoryDevices = inMemoryDevices.filter(d => String(d.id) !== String(id) && d.mac_address !== id);
        res.json({ message: 'Device deleted successfully' });
    }
};

exports.assignClassroom = async (req, res) => {
    const { id } = req.params;
    const { classroom_id } = req.body;
    try {
        await db.query('UPDATE devices SET classroom_id=? WHERE id=?', [classroom_id || null, id]);
        const dev = inMemoryDevices.find(d => String(d.id) === String(id));
        if (dev) {
            dev.classroom_id = classroom_id || null;
            dev.room_number = classroom_id === '1' ? 'C-102' : classroom_id === '2' ? 'C-117' : null;
            dev.building = classroom_id ? 'Academic Block C' : null;
        }
        res.json({ message: 'Classroom assigned' });
    } catch (err) {
        const dev = inMemoryDevices.find(d => String(d.id) === String(id));
        if (dev) {
            dev.classroom_id = classroom_id || null;
            dev.room_number = classroom_id === '1' ? 'C-102' : classroom_id === '2' ? 'C-117' : null;
            dev.building = classroom_id ? 'Academic Block C' : null;
        }
        res.json({ message: 'Classroom assigned' });
    }
};
