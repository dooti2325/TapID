const db = require('../config/database');

class Student {
  static async findAll() {
    const [rows] = await db.execute(`
      SELECT s.id, s.name, s.enrollment_number, s.section_id, sec.name AS section_name,
             r.uid AS rfid_uid, r.status AS card_status
      FROM students s
      LEFT JOIN sections sec ON s.section_id = sec.id
      LEFT JOIN rfid_cards r ON r.student_id = s.id
      ORDER BY s.id DESC
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(`
      SELECT s.id, s.name, s.enrollment_number, s.section_id, sec.name AS section_name,
             r.uid AS rfid_uid, r.status AS card_status
      FROM students s
      LEFT JOIN sections sec ON s.section_id = sec.id
      LEFT JOIN rfid_cards r ON r.student_id = s.id
      WHERE s.id = ?
    `, [id]);
    return rows[0] || null;
  }

  static async findByEnrollment(enrollment) {
    const [rows] = await db.execute('SELECT * FROM students WHERE enrollment_number = ?', [enrollment]);
    return rows[0] || null;
  }

  static async create({ name, enrollment_number, section_id, user_id = null }) {
    const [result] = await db.execute(
      'INSERT INTO students (name, enrollment_number, section_id, user_id) VALUES (?, ?, ?, ?)',
      [name, enrollment_number, section_id || null, user_id]
    );
    return result.insertId;
  }

  static async update(id, { name, enrollment_number, section_id }) {
    await db.execute(
      'UPDATE students SET name = ?, enrollment_number = ?, section_id = ? WHERE id = ?',
      [name, enrollment_number, section_id || null, id]
    );
    return true;
  }

  static async delete(id) {
    await db.execute('DELETE FROM students WHERE id = ?', [id]);
    return true;
  }

  static async count() {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM students');
    return rows[0].count;
  }
}

module.exports = Student;
