const db = require('../config/database');

class Subject {
  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM subjects ORDER BY code ASC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM subjects WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findByCode(code) {
    const [rows] = await db.execute('SELECT * FROM subjects WHERE code = ?', [code]);
    return rows[0] || null;
  }

  static async create({ code, name, semester }) {
    const [result] = await db.execute(
      'INSERT INTO subjects (code, name, semester) VALUES (?, ?, ?)',
      [code, name, semester]
    );
    return result.insertId;
  }

  static async update(id, { code, name, semester }) {
    await db.execute(
      'UPDATE subjects SET code = ?, name = ?, semester = ? WHERE id = ?',
      [code, name, semester, id]
    );
    return true;
  }

  static async delete(id) {
    await db.execute('DELETE FROM subjects WHERE id = ?', [id]);
    return true;
  }

  static async count() {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM subjects');
    return rows[0].count;
  }
}

module.exports = Subject;
