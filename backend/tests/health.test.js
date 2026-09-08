const request = require('supertest');
const app = require('../app');

describe('Health Check API', () => {
  it('GET /api/health should return 200 OK and status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('message');
  });
});
