const request = require('supertest');
const app = require('../app');

jest.mock('../config/database', () => ({
  execute: jest.fn(),
  query: jest.fn(),
}));

const db = require('../config/database');

const makeToken = (role = 'admin') => {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ id: 1, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
};

describe('Device API', () => {
  let adminToken, facultyToken;

  beforeAll(() => {
    adminToken = makeToken('admin');
    facultyToken = makeToken('faculty');
  });
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/devices — admin sees all devices', async () => {
    db.query.mockResolvedValueOnce([[
      { id: 1, mac_address: '00:11:22:33:44:55', status: 'online', room_number: '101' }
    ]]);

    const res = await request(app)
      .get('/api/devices')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/devices — faculty can also list devices', async () => {
    db.query.mockResolvedValueOnce([[{ id: 1, mac_address: '00:11:22:33:44:55', status: 'offline' }]]);

    const res = await request(app)
      .get('/api/devices')
      .set('Authorization', `Bearer ${facultyToken}`);

    expect(res.statusCode).toBe(200);
  });

  it('POST /api/devices — admin registers a new device', async () => {
    db.query.mockResolvedValueOnce([{ insertId: 7 }]);

    const res = await request(app)
      .post('/api/devices')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ mac_address: 'AA:BB:CC:DD:EE:FF', classroom_id: 2 });

    expect(res.statusCode).toBe(201);
    expect(res.body.mac_address).toBe('AA:BB:CC:DD:EE:FF');
    expect(res.body.status).toBe('offline');
  });

  it('POST /api/devices — rejects duplicate MAC', async () => {
    const dupErr = new Error('Duplicate');
    dupErr.code = 'ER_DUP_ENTRY';
    db.query.mockRejectedValueOnce(dupErr);

    const res = await request(app)
      .post('/api/devices')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ mac_address: 'AA:BB:CC:DD:EE:FF' });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('POST /api/devices — non-admin cannot register device', async () => {
    const res = await request(app)
      .post('/api/devices')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({ mac_address: 'AA:BB:CC:DD:EE:FF' });

    expect(res.statusCode).toBe(403);
  });

  it('POST /api/devices/status — ESP32 can update device status without auth', async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .post('/api/devices/status')
      .send({ mac_address: '00:11:22:33:44:55', status: 'online' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/updated/i);
  });

  it('DELETE /api/devices/:id — admin deletes device', async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .delete('/api/devices/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it('DELETE /api/devices/:id — 404 for unknown device', async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const res = await request(app)
      .delete('/api/devices/999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });
});
