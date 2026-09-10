const request = require('supertest');
const app = require('../app');

jest.mock('../config/database', () => ({
  execute: jest.fn(),
  query: jest.fn(),
  getConnection: jest.fn(),
}));

const db = require('../config/database');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../utils/jwt');

describe('Security & Hardening Suite (Red Team Remediations)', () => {
  const adminToken = jwt.sign({ id: 1, email: 'admin@tapid.edu', role: 'admin' }, getJwtSecret());

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('C-1 & Device Authentication', () => {
    const originalApiKey = process.env.DEVICE_API_KEY;

    afterEach(() => {
      if (originalApiKey !== undefined) {
        process.env.DEVICE_API_KEY = originalApiKey;
      } else {
        delete process.env.DEVICE_API_KEY;
      }
    });

    it('rejects attendance record when DEVICE_API_KEY is configured and missing from request', async () => {
      process.env.DEVICE_API_KEY = 'secret-test-key-1234';

      const res = await request(app)
        .post('/api/attendance/record')
        .send({ rfid_uid: 'A1B2C3D4', mac_address: '00:11:22:33:44:55' });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/Unauthorized/i);
    });

    it('rejects attendance record when invalid X-Device-Key is provided', async () => {
      process.env.DEVICE_API_KEY = 'secret-test-key-1234';

      const res = await request(app)
        .post('/api/attendance/record')
        .set('X-Device-Key', 'wrong-key')
        .send({ rfid_uid: 'A1B2C3D4', mac_address: '00:11:22:33:44:55' });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/Unauthorized/i);
    });

    it('accepts attendance tap when valid X-Device-Key is supplied', async () => {
      process.env.DEVICE_API_KEY = 'secret-test-key-1234';
      db.execute
        .mockResolvedValueOnce([[{ classroom_id: 1, status: 'online' }]])
        .mockResolvedValueOnce([[{ id: 10 }]])
        .mockResolvedValueOnce([[{ id: 3, student_id: 20, status: 'active' }]])
        .mockResolvedValueOnce([[{ id: 20, name: 'Bob' }]])
        .mockResolvedValueOnce([{ insertId: 101 }]);

      const res = await request(app)
        .post('/api/attendance/record')
        .set('X-Device-Key', 'secret-test-key-1234')
        .send({ rfid_uid: 'A1B2C3D4', mac_address: '00:11:22:33:44:55' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('C-2 & Device Status Protection', () => {
    it('rejects invalid device status values', async () => {
      const res = await request(app)
        .post('/api/devices/status')
        .send({ mac_address: '00:11:22:33:44:55', status: 'invalid_status' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Invalid status/i);
    });

    it('prevents updating status of revoked devices', async () => {
      // First update returns affectedRows 0 because status != revoked clause prevents it
      db.query
        .mockResolvedValueOnce([{ affectedRows: 0 }])
        .mockResolvedValueOnce([[{ status: 'revoked' }]]);

      const res = await request(app)
        .post('/api/devices/status')
        .send({ mac_address: '00:11:22:33:44:55', status: 'online' });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/revoked/i);
    });
  });

  describe('C-4 & Faculty Secure Password Generation', () => {
    it('generates a strong random temporary password if none is provided', async () => {
      const mockConn = {
        beginTransaction: jest.fn().mockResolvedValue(),
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue(),
        release: jest.fn(),
        query: jest.fn()
          .mockResolvedValueOnce([{ insertId: 50 }]) // user insert
          .mockResolvedValueOnce([{ insertId: 60 }]), // faculty insert
      };
      db.getConnection.mockResolvedValueOnce(mockConn);

      const res = await request(app)
        .post('/api/faculty')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Dr. Jane Smith', email: 'jane.smith@tapid.edu' });

      expect(res.statusCode).toBe(201);
      expect(res.body.temp_password).toBeDefined();
      expect(res.body.temp_password).not.toBe('TapID@2026');
      expect(res.body.temp_password.length).toBeGreaterThanOrEqual(12);
    });
  });

  describe('C-5 & Security Headers', () => {
    it('includes HSTS and CSP headers in responses', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['strict-transport-security']).toBeDefined();
      expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    });

    it('rejects unauthorized CORS origins with 403', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'https://malicious-attacker-domain.evil');

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Not allowed by CORS/i);
    });
  });

  describe('H-5 & Bulk Attendance Bounds', () => {
    it('rejects bulk requests exceeding 50 records', async () => {
      const hugeRecords = Array.from({ length: 51 }, (_, i) => ({
        rfid_uid: `UID${i}`,
        timestamp: new Date().toISOString(),
      }));

      const res = await request(app)
        .post('/api/attendance/bulk-record')
        .send({ mac_address: '00:11:22:33:44:55', records: hugeRecords });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/exceeds maximum limit/i);
    });
  });
});
