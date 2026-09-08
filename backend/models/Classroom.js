const db = require('../config/database');

class Classroom {
  static async findAll() {
    const [rows] = await db.execute(`
      SELECT c.*, d.id AS device_id, d.mac_address, d.status AS device_status
      FROM classrooms c
      LEFT JOIN devices d ON d.classroom_id = c.id
      ORDER BY c.room_number ASC
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM classrooms WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findByRoomNumber(roomNumber) {
    const [rows] = await db.execute('SELECT * FROM classrooms WHERE room_number = ?', [roomNumber]);
    return rows[0] || null;
  }

  static async create({ room_number, building }) {
    const [result] = await db.execute(
      'INSERT INTO classrooms (room_number, building) VALUES (?, ?)',
      [room_number, building]
    );
    return result.insertId;
  }

  static async update(id, { room_number, building }) {
    await db.execute(
      'UPDATE classrooms SET room_number = ?, building = ? WHERE id = ?',
      [room_number, building, id]
    );
    return true;
  }

  static async count() {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM classrooms');
    return rows[0].count;
  }
}

module.exports = Classroom;
