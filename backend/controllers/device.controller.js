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

exports.heartbeat = async (req, res) => {
    const { mac_address } = req.body;
    if (!mac_address) {
        return res.status(400).json({ message: 'mac_address is required' });
    }

    try {
        const [devices] = await db.query(`
            SELECT d.id, d.mac_address, d.classroom_id, d.status,
                   c.room_number, c.building
            FROM devices d
            LEFT JOIN classrooms c ON d.classroom_id = c.id
            WHERE d.mac_address = ?
        `, [mac_address]);

        if (devices.length === 0) {
            return res.status(404).json({ message: 'Device not registered' });
        }

        const device = devices[0];
        if (device.status === 'revoked') {
            return res.status(403).json({ message: 'Device is revoked and unauthorized' });
        }

        // Keep device marked as online
        if (device.status !== 'online') {
            await db.query("UPDATE devices SET status = 'online' WHERE id = ?", [device.id]);
        }

        // Query active session for this classroom
        let activeSession = null;
        if (device.classroom_id) {
            const [sessions] = await db.query(`
                SELECT s.id, s.start_time, sub.name AS subject_name, sub.code AS subject_code,
                       f.name AS faculty_name, sec.id AS section_id, sec.name AS section_name
                FROM attendance_sessions s
                JOIN subjects sub ON s.subject_id = sub.id
                JOIN faculty f ON s.faculty_id = f.id
                LEFT JOIN timetable t ON s.timetable_id = t.id
                LEFT JOIN sections sec ON t.section_id = sec.id
                WHERE s.classroom_id = ? AND s.status = 'active'
                ORDER BY s.id DESC LIMIT 1
            `, [device.classroom_id]);

            if (sessions.length > 0) {
                const s = sessions[0];
                activeSession = {
                    session_id: s.id,
                    subject: s.subject_name,
                    subject_code: s.subject_code,
                    faculty: s.faculty_name,
                    section: s.section_name || 'All Sections',
                    section_id: s.section_id || null,
                    start_time: s.start_time
                };
            }
        }

        res.json({
            success: true,
            status: 'online',
            device_id: device.id,
            classroom_id: device.classroom_id,
            room_number: device.room_number || 'Unassigned',
            building: device.building || '',
            active_session: activeSession
        });
    } catch (err) {
        res.status(500).json({ message: 'Error processing heartbeat', error: err.message });
    }
};

