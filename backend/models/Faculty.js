const db = require('../config/database');

class Faculty {
  static async findAll() {
    const [rows] = await db.execute(`
      SELECT f.id, f.name, f.phone, f.department, u.email
      FROM faculty f
      JOIN users u ON f.user_id = u.id
      ORDER BY f.id DESC
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(`
      SELECT f.id, f.name, f.phone, f.department, u.email
      FROM faculty f
      JOIN users u ON f.user_id = u.id
      WHERE f.id = ?
    `, [id]);
    return rows[0] || null;
  }

  static async findByUserId(userId) {
    const [rows] = await db.execute('SELECT * FROM faculty WHERE user_id = ?', [userId]);
    return rows[0] || null;
  }

  static async create({ user_id, name, phone, department }) {
    const [result] = await db.execute(
      'INSERT INTO faculty (user_id, name, phone, department) VALUES (?, ?, ?, ?)',
      [user_id, name, phone || null, department || null]
    );
    return result.insertId;
  }

  static async update(id, { name, phone, department }) {
    await db.execute(
      'UPDATE faculty SET name = ?, phone = ?, department = ? WHERE id = ?',
      [name, phone || null, department || null, id]
    );
    return true;
  }

  static async delete(id) {
    await db.execute('DELETE FROM faculty WHERE id = ?', [id]);
    return true;
  }

  static async count() {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM faculty');
    return rows[0].count;
  }
}

module.exports = Faculty;
