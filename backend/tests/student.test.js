const request = require('supertest');
const app = require('../app');

jest.mock('../config/database', () => ({
  execute: jest.fn(),
  query: jest.fn(),
  getConnection: jest.fn(),
}));

const db = require('../config/database');

const makeToken = (role = 'admin') => {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ id: 1, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
};

const mockConnection = () => {
  const conn = {
    beginTransaction: jest.fn().mockResolvedValue(),
    query: jest.fn(),
    commit: jest.fn().mockResolvedValue(),
    rollback: jest.fn().mockResolvedValue(),
    release: jest.fn(),
  };
  db.getConnection.mockResolvedValue(conn);
  return conn;
};

describe('Students API', () => {
  let adminToken;

  beforeAll(() => { adminToken = makeToken('admin'); });
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/students — returns student list', async () => {
    db.query.mockResolvedValueOnce([[
      { id: 1, name: 'Alice', enrollment_number: 'EN001', section_name: 'A', rfid_uid: 'AA:BB' }
    ]]);

    const res = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/students — rejects unauthenticated', async () => {
    const res = await request(app).get('/api/students');
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/students — creates student without RFID', async () => {
    const conn = mockConnection();
    conn.query.mockResolvedValueOnce([{ insertId: 42 }]);

    const res = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Bob', enrollment_number: 'EN002', section_id: 1 });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBe(42);
  });

  it('POST /api/students — creates student with RFID', async () => {
    const conn = mockConnection();
    conn.query
      .mockResolvedValueOnce([{ insertId: 43 }]) // insert student
      .mockResolvedValueOnce([{ insertId: 1 }]);  // insert rfid_card

    const res = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Carol', enrollment_number: 'EN003', section_id: 1, rfid_uid: 'CC:DD:EE:FF' });

    expect(res.statusCode).toBe(201);
    expect(res.body.rfid_uid).toBe('CC:DD:EE:FF');
  });

  it('PUT /api/students/:id — updates student', async () => {
    const conn = mockConnection();
    conn.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/api/students/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated', enrollment_number: 'EN001', section_id: 2 });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/updated/i);
  });

  it('DELETE /api/students/:id — deletes student', async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .delete('/api/students/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
