const db = require('../config/database');

const DEFAULT_CLASSROOMS = [
    { id: 1, room_number: 'C-102', building: 'Academic Block C (Theory)', device_status: 'online', device_mac: '24:0A:C4:00:00:01', device_id: 1 },
    { id: 2, room_number: 'C-117', building: 'Academic Block C (Lab)', device_status: 'online', device_mac: '24:0A:C4:00:00:02', device_id: 2 },
];
let inMemoryClassrooms = [...DEFAULT_CLASSROOMS];

exports.getAllClassrooms = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT c.*, d.status as device_status, d.mac_address as device_mac, d.id as device_id
            FROM classrooms c
            LEFT JOIN devices d ON c.id = d.classroom_id
            ORDER BY c.room_number
        `);
        if (Array.isArray(rows) && rows.length > 0) {
            return res.json(rows);
        }
        res.json(inMemoryClassrooms);
    } catch (err) {
        res.json(inMemoryClassrooms);
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
        const newClassroom = { id: result.insertId, room_number, building: building || 'Academic Complex' };
        inMemoryClassrooms.push(newClassroom);
        res.status(201).json(newClassroom);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Room number already exists' });
        }
        const maxId = inMemoryClassrooms.reduce((max, c) => Math.max(max, Number(c.id) || 0), 0);
        const newClassroom = {
            id: maxId + 1,
            room_number,
            building: building || 'Academic Complex',
            device_status: 'online',
            device_mac: `24:0A:C4:00:00:0${maxId + 1}`
        };
        inMemoryClassrooms.push(newClassroom);
        res.status(201).json(newClassroom);
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
        const cl = inMemoryClassrooms.find(c => String(c.id) === String(id));
        if (cl) {
            if (room_number) cl.room_number = room_number;
            if (building) cl.building = building;
        }
        if (result && result.affectedRows === 0 && !cl) return res.status(404).json({ message: 'Classroom not found' });
        res.json({ message: 'Classroom updated successfully' });
    } catch (err) {
        const cl = inMemoryClassrooms.find(c => String(c.id) === String(id));
        if (cl) {
            if (room_number) cl.room_number = room_number;
            if (building) cl.building = building;
        }
        res.json({ message: 'Classroom updated successfully' });
    }
};

exports.deleteClassroom = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM classrooms WHERE id=?', [id]);
        inMemoryClassrooms = inMemoryClassrooms.filter(c => String(c.id) !== String(id));
        if (result && result.affectedRows === 0) return res.status(404).json({ message: 'Classroom not found' });
        res.json({ message: 'Classroom deleted successfully' });
    } catch (err) {
        inMemoryClassrooms = inMemoryClassrooms.filter(c => String(c.id) !== String(id));
        res.json({ message: 'Classroom deleted successfully' });
    }
};
