const db = require('../config/database');

class RfidCard {
  static async findAll() {
    const [rows] = await db.execute(`
      SELECT r.*, s.name AS student_name, s.enrollment_number
      FROM rfid_cards r
      LEFT JOIN students s ON r.student_id = s.id
      ORDER BY r.id DESC
    `);
    return rows;
  }

  static async findByUid(uid) {
    const [rows] = await db.execute(`
      SELECT r.*, s.name AS student_name, s.enrollment_number
      FROM rfid_cards r
      LEFT JOIN students s ON r.student_id = s.id
      WHERE r.uid = ?
    `, [uid]);
    return rows[0] || null;
  }

  static async create({ uid, student_id = null, status = 'active' }) {
    const [result] = await db.execute(
      'INSERT INTO rfid_cards (uid, student_id, status) VALUES (?, ?, ?)',
      [uid, student_id, status]
    );
    return result.insertId;
  }

  static async assignStudent(id, studentId) {
    await db.execute('UPDATE rfid_cards SET student_id = ? WHERE id = ?', [studentId, id]);
    return true;
  }

  static async updateStatus(id, status) {
    await db.execute('UPDATE rfid_cards SET status = ? WHERE id = ?', [status, id]);
    return true;
  }

  static async count() {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM rfid_cards');
    return rows[0].count;
  }
}

module.exports = RfidCard;
