const db = require('../config/database');

class Attendance {
  static async record({ session_id, student_id, rfid_card_id, timestamp = new Date() }) {
    const [result] = await db.execute(
      'INSERT INTO attendance (session_id, student_id, rfid_card_id, timestamp, status) VALUES (?, ?, ?, ?, ?)',
      [session_id, student_id, rfid_card_id, timestamp, 'present']
    );
    return result.insertId;
  }

  static async findBySession(sessionId) {
    const [rows] = await db.execute(`
      SELECT a.id, a.timestamp, a.status, s.id AS student_id, s.name, s.enrollment_number
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE a.session_id = ?
      ORDER BY a.timestamp DESC
    `, [sessionId]);
    return rows;
  }

  static async countBySession(sessionId) {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM attendance WHERE session_id = ?', [sessionId]);
    return rows[0].count;
  }

  static async getAttendanceReport({ startDate, endDate, subjectId, sectionId }) {
    let query = `
      SELECT a.id, a.timestamp, a.status, s.name AS student_name, s.enrollment_number,
             sec.name AS section_name, sub.name AS subject_name, ses.session_date
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN sections sec ON s.section_id = sec.id
      JOIN attendance_sessions ses ON a.session_id = ses.id
      JOIN subjects sub ON ses.subject_id = sub.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND ses.session_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND ses.session_date <= ?';
      params.push(endDate);
    }
    if (subjectId) {
      query += ' AND sub.id = ?';
      params.push(subjectId);
    }
    if (sectionId) {
      query += ' AND sec.id = ?';
      params.push(sectionId);
    }

    query += ' ORDER BY a.timestamp DESC';
    const [rows] = await db.execute(query, params);
    return rows;
  }
}

module.exports = Attendance;
