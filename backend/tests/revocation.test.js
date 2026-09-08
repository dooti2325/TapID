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

describe('Revocation API', () => {
  let adminToken, facultyToken;

  beforeAll(() => {
    adminToken  = makeToken('admin');
    facultyToken = makeToken('faculty');
  });
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/revocation/card', () => {
    it('admin can revoke a card by UID', async () => {
      db.execute
        .mockResolvedValueOnce([{ affectedRows: 1 }])   // UPDATE rfid_cards
        .mockResolvedValueOnce([{ insertId: 1 }]);       // audit log

      const res = await request(app)
        .post('/api/revocation/card')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ uid: 'AA:BB:CC:DD' });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/revoked/i);
    });

    it('returns 404 when card UID does not exist', async () => {
      db.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app)
        .post('/api/revocation/card')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ uid: 'NONEXISTENT' });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/card not found/i);
    });

    it('returns 400 when uid is missing', async () => {
      const res = await request(app)
        .post('/api/revocation/card')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
    });

    it('non-admin is forbidden', async () => {
      const res = await request(app)
        .post('/api/revocation/card')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ uid: 'AA:BB:CC:DD' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('POST /api/revocation/device', () => {
    it('admin can revoke a device by MAC', async () => {
      db.execute
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([{ insertId: 2 }]);

      const res = await request(app)
        .post('/api/revocation/device')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ mac_address: '00:11:22:33:44:55' });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/revoked/i);
    });

    it('returns 404 when device MAC does not exist', async () => {
      db.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app)
        .post('/api/revocation/device')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ mac_address: 'FF:FF:FF:FF:FF:FF' });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/device not found/i);
    });

    it('returns 400 when mac_address is missing', async () => {
      const res = await request(app)
        .post('/api/revocation/device')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
    });
  });
});
