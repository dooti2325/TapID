const request = require('supertest');
const app = require('../app');
const path = require('path');
const fs = require('fs');

describe('Logs API', () => {
  let adminToken;
  let logDir;

  beforeAll(() => {
    const jwt = require('jsonwebtoken');
    adminToken = jwt.sign({ id: 1, role: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    
    // Create dummy log file
    logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.writeFileSync(path.join(logDir, 'app-2099-01-01.log'), 'dummy log content');
  });

  afterAll(() => {
    if (fs.existsSync(path.join(logDir, 'app-2099-01-01.log'))) {
        fs.unlinkSync(path.join(logDir, 'app-2099-01-01.log'));
    }
  });

  it('should allow admin to fetch logs', async () => {
    const res = await request(app)
      .get('/api/logs')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('dummy log content');
  });
});
