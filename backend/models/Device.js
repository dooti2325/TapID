const db = require('../config/database');

class Device {
  static async findAll() {
    const [rows] = await db.execute(`
      SELECT d.*, c.room_number, c.building
      FROM devices d
      LEFT JOIN classrooms c ON d.classroom_id = c.id
      ORDER BY d.id DESC
    `);
    return rows;
  }

  static async findByMac(macAddress) {
    const [rows] = await db.execute(`
      SELECT d.*, c.room_number
      FROM devices d
      LEFT JOIN classrooms c ON d.classroom_id = c.id
      WHERE d.mac_address = ?
    `, [macAddress]);
    return rows[0] || null;
  }

  static async create({ mac_address, classroom_id, status = 'offline' }) {
    const [result] = await db.execute(
      'INSERT INTO devices (mac_address, classroom_id, status) VALUES (?, ?, ?)',
      [mac_address, classroom_id || null, status]
    );
    return result.insertId;
  }

  static async updateStatus(id, status) {
    await db.execute('UPDATE devices SET status = ? WHERE id = ?', [status, id]);
    return true;
  }

  static async count() {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM devices');
    return rows[0].count;
  }
}

module.exports = Device;
