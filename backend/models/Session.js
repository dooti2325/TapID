const db = require('../config/database');

class Session {
  static async findActiveByClassroom(classroomId) {
    const [rows] = await db.execute(
      'SELECT id, faculty_id, subject_id, classroom_id, session_date, start_time FROM attendance_sessions WHERE classroom_id = ? AND status = ?',
      [classroomId, 'active']
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await db.execute(`
      SELECT ses.*, sub.name AS subject_name, c.room_number, f.name AS faculty_name
      FROM attendance_sessions ses
      JOIN subjects sub ON ses.subject_id = sub.id
      JOIN classrooms c ON ses.classroom_id = c.id
      JOIN faculty f ON ses.faculty_id = f.id
      WHERE ses.id = ?
    `, [id]);
    return rows[0] || null;
  }

  static async findActiveSessions() {
    const [rows] = await db.execute(`
      SELECT ses.*, sub.name AS subject_name, c.room_number, f.name AS faculty_name
      FROM attendance_sessions ses
      JOIN subjects sub ON ses.subject_id = sub.id
      JOIN classrooms c ON ses.classroom_id = c.id
      JOIN faculty f ON ses.faculty_id = f.id
      WHERE ses.status = 'active'
      ORDER BY ses.id DESC
    `);
    return rows;
  }

  static async start({ timetable_id, faculty_id, subject_id, classroom_id }) {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];

    const [result] = await db.execute(`
      INSERT INTO attendance_sessions
      (timetable_id, faculty_id, subject_id, classroom_id, session_date, start_time, status)
      VALUES (?, ?, ?, ?, ?, ?, 'active')
    `, [timetable_id || null, faculty_id, subject_id, classroom_id, today, currentTime]);

    return result.insertId;
  }

  static async end(id) {
    const currentTime = new Date().toTimeString().split(' ')[0];
    await db.execute(
      'UPDATE attendance_sessions SET status = "completed", end_time = ? WHERE id = ?',
      [currentTime, id]
    );
    return true;
  }
}

module.exports = Session;
