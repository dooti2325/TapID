const request = require('supertest');
const app = require('../app');

jest.mock('../config/database', () => ({
  execute: jest.fn(),
}));

const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Auth API', () => {
  const validHash = bcrypt.hashSync('password123', 10);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/auth/login — succeeds with valid credentials', async () => {
    db.execute
      .mockResolvedValueOnce([[{
        id: 1,
        email: 'admin@tapid.edu',
        password_hash: validHash,
        role: 'admin',
      }]])
      .mockResolvedValueOnce([[{ id: 1, name: 'Admin User' }]]); // faculty profile

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@tapid.edu', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.role).toBe('admin');
  });

  it('POST /api/auth/login — rejects wrong password', async () => {
    db.execute.mockResolvedValueOnce([[{
      id: 1,
      email: 'admin@tapid.edu',
      password_hash: validHash,
      role: 'admin',
    }]]);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@tapid.edu', password: 'wrongpassword' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it('POST /api/auth/login — rejects unknown email', async () => {
    db.execute.mockResolvedValueOnce([[]]);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@tapid.edu', password: 'password123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });
});
