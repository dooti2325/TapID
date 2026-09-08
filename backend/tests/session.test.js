const request = require('supertest');
const app = require('../app');

jest.mock('../config/database', () => ({
  execute: jest.fn(),
  query: jest.fn(),
}));

const db = require('../config/database');

const makeToken = (role = 'faculty', id = 2) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
};

describe('Session API', () => {
  let facultyToken;

  beforeAll(() => { facultyToken = makeToken('faculty', 2); });
  beforeEach(() => jest.clearAllMocks());

  it('POST /api/session/start — faculty starts a session', async () => {
    db.execute
      .mockResolvedValueOnce([[{ id: 5 }]])           // faculty lookup by user_id
      .mockResolvedValueOnce([{ insertId: 99 }]);      // insert session

    const res = await request(app)
      .post('/api/session/start')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({ timetable_id: 1, subject_id: 2, classroom_id: 3 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('session_id', 99);
  });

  it('POST /api/session/start — rejects non-faculty users', async () => {
    db.execute.mockResolvedValueOnce([[]]); // no faculty record for this user_id

    const res = await request(app)
      .post('/api/session/start')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({ timetable_id: 1, subject_id: 2, classroom_id: 3 });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/not faculty/i);
  });

  it('POST /api/session/start — rejects unauthenticated', async () => {
    const res = await request(app).post('/api/session/start').send({});
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/session/end/:id — ends active session', async () => {
    db.execute
      .mockResolvedValueOnce([[{ id: 5 }]])    // faculty lookup
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // update session

    const res = await request(app)
      .post('/api/session/end/99')
      .set('Authorization', `Bearer ${facultyToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/session ended/i);
  });

  it('GET /api/session/active — returns active session for faculty', async () => {
    db.execute
      .mockResolvedValueOnce([[{ id: 5 }]])
      .mockResolvedValueOnce([[{
        id: 99, status: 'active', subject_id: 2, classroom_id: 3, faculty_id: 5
      }]]);

    const res = await request(app)
      .get('/api/session/active')
      .set('Authorization', `Bearer ${facultyToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', 99);
  });

  it('GET /api/session/active — returns null when no active session', async () => {
    db.execute
      .mockResolvedValueOnce([[{ id: 5 }]])
      .mockResolvedValueOnce([[]]); // no active sessions

    const res = await request(app)
      .get('/api/session/active')
      .set('Authorization', `Bearer ${facultyToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeNull();
  });
});
