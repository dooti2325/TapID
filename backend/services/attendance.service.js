const db = require('../config/database');

const recordTap = async (rfidUid, macAddress) => {
  // 1. Find device and classroom
  const [devices] = await db.execute('SELECT classroom_id, status FROM devices WHERE mac_address = ?', [macAddress]);
  if (devices.length === 0) {
    const err = new Error('Device not registered');
    err.status = 404;
    throw err;
  }
  if (devices[0].status === 'revoked') {
    const err = new Error('Device revoked');
    err.status = 403;
    throw err;
  }
  const classroomId = devices[0].classroom_id;

  // 2. Find active session for this classroom
  const [sessions] = await db.execute(
    'SELECT id FROM attendance_sessions WHERE classroom_id = ? AND status = ?',
    [classroomId, 'active']
  );
  if (sessions.length === 0) {
    const err = new Error('No active session in this classroom');
    err.status = 400;
    throw err;
  }
  const sessionId = sessions[0].id;

  // 3. Find card
  const [cards] = await db.execute('SELECT id, student_id, status FROM rfid_cards WHERE uid = ?', [rfidUid]);
  if (cards.length === 0) {
    const err = new Error('Card not found');
    err.status = 404;
    throw err;
  }
  if (cards[0].status !== 'active') {
    const err = new Error('Card not active');
    err.status = 403;
    throw err;
  }
  const card = cards[0];

  // 4. Find student
  const [students] = await db.execute('SELECT id, name FROM students WHERE id = ?', [card.student_id]);
  if (students.length === 0) {
    const err = new Error('Student not found');
    err.status = 404;
    throw err;
  }
  const student = students[0];

  // 5. Insert record
  try {
    await db.execute(
      'INSERT INTO attendance (session_id, student_id, rfid_card_id) VALUES (?, ?, ?)',
      [sessionId, student.id, card.id]
    );
    return { success: true, message: 'Attendance recorded', student_name: student.name };
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      const dupErr = new Error('Attendance already recorded');
      dupErr.status = 409;
      throw dupErr;
    }
    throw err;
  }
};

const bulkRecord = async (macAddress, records = []) => {
  const [devices] = await db.execute('SELECT classroom_id, status FROM devices WHERE mac_address = ?', [macAddress]);
  if (devices.length === 0 || devices[0].status === 'revoked') {
    const err = new Error('Device invalid');
    err.status = 403;
    throw err;
  }
  const classroomId = devices[0].classroom_id;

  const [sessions] = await db.execute(
    'SELECT id FROM attendance_sessions WHERE classroom_id = ? AND status = ?',
    [classroomId, 'active']
  );
  if (sessions.length === 0) {
    const err = new Error('No active session');
    err.status = 400;
    throw err;
  }
  const sessionId = sessions[0].id;

  let added = 0;
  let errors = 0;

  for (const record of records) {
    try {
      const [cards] = await db.execute(
        'SELECT id, student_id FROM rfid_cards WHERE uid = ? AND status = "active"',
        [record.rfid_uid]
      );
      if (cards.length > 0) {
        await db.execute(
          'INSERT INTO attendance (session_id, student_id, rfid_card_id, timestamp) VALUES (?, ?, ?, ?)',
          [sessionId, cards[0].student_id, cards[0].id, new Date(record.timestamp || Date.now())]
        );
        added++;
      } else {
        errors++;
      }
    } catch (err) {
      if (err.code !== 'ER_DUP_ENTRY') {
        errors++;
      }
    }
  }

  return { success: true, added, errors };
};

module.exports = {
  recordTap,
  bulkRecord,
};
