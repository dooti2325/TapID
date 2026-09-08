const request = require('supertest');
const app = require('../app');

jest.mock('../config/database', () => ({
  execute: jest.fn(),
  query: jest.fn(),
}));

const db = require('../config/database');

describe('Attendance API', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/attendance/record — RFID tap flow', () => {
    const validTap = { rfid_uid: 'AA:BB:CC:DD', mac_address: '00:11:22:33:44:55' };

    it('records attendance successfully', async () => {
      db.execute
        .mockResolvedValueOnce([[{ classroom_id: 1, status: 'online' }]])     // device
        .mockResolvedValueOnce([[{ id: 5 }]])                                  // active session
        .mockResolvedValueOnce([[{ id: 2, student_id: 10, status: 'active' }]]) // card
        .mockResolvedValueOnce([[{ id: 10, name: 'Alice' }]])                  // student
        .mockResolvedValueOnce([{ insertId: 99 }]);                            // insert

      const res = await request(app).post('/api/attendance/record').send(validTap);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.student_name).toBe('Alice');
    });

    it('returns 404 for unregistered device', async () => {
      db.execute.mockResolvedValueOnce([[]]); // no device
      const res = await request(app).post('/api/attendance/record').send(validTap);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/device not registered/i);
    });

    it('returns 403 for revoked device', async () => {
      db.execute.mockResolvedValueOnce([[{ classroom_id: 1, status: 'revoked' }]]);
      const res = await request(app).post('/api/attendance/record').send(validTap);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/revoked/i);
    });

    it('returns 400 when no active session exists', async () => {
      db.execute
        .mockResolvedValueOnce([[{ classroom_id: 1, status: 'online' }]])
        .mockResolvedValueOnce([[]]); // no session
      const res = await request(app).post('/api/attendance/record').send(validTap);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/no active session/i);
    });

    it('returns 409 for duplicate attendance', async () => {
      const dupErr = new Error('Duplicate entry');
      dupErr.code = 'ER_DUP_ENTRY';
      db.execute
        .mockResolvedValueOnce([[{ classroom_id: 1, status: 'online' }]])
        .mockResolvedValueOnce([[{ id: 5 }]])
        .mockResolvedValueOnce([[{ id: 2, student_id: 10, status: 'active' }]])
        .mockResolvedValueOnce([[{ id: 10, name: 'Alice' }]])
        .mockRejectedValueOnce(dupErr);

      const res = await request(app).post('/api/attendance/record').send(validTap);
      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/attendance/bulk-record', () => {
    it('processes bulk records and returns summary', async () => {
      db.execute
        .mockResolvedValueOnce([[{ classroom_id: 1, status: 'online' }]])
        .mockResolvedValueOnce([[{ id: 5 }]])
        // record 1: valid card
        .mockResolvedValueOnce([[{ id: 2, student_id: 10 }]])
        .mockResolvedValueOnce([{ insertId: 99 }])
        // record 2: unknown card
        .mockResolvedValueOnce([[]]); // no card

      const res = await request(app)
        .post('/api/attendance/bulk-record')
        .send({
          mac_address: '00:11:22:33:44:55',
          records: [
            { rfid_uid: 'AA:BB', timestamp: new Date().toISOString() },
            { rfid_uid: 'ZZ:ZZ', timestamp: new Date().toISOString() },
          ],
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('added');
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/attendance/session/:id', () => {
    it('returns session attendance when authenticated', async () => {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: 1, role: 'faculty' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

      db.execute.mockResolvedValueOnce([[
        { timestamp: new Date(), name: 'Alice', enrollment_number: 'EN001', status: 'present' }
      ]]);

      const res = await request(app)
        .get('/api/attendance/session/5')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('rejects unauthenticated requests', async () => {
      const res = await request(app).get('/api/attendance/session/5');
      expect(res.statusCode).toBe(401);
    });
  });
});
