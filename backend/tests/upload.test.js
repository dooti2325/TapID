const request = require('supertest');
const app = require('../app');
const path = require('path');
const fs = require('fs');

describe('Upload API', () => {
  let token;

  beforeAll(() => {
    const jwt = require('jsonwebtoken');
    token = jwt.sign({ id: 1, role: 'teacher' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    
    // Create dummy image file for testing
    fs.writeFileSync(path.join(__dirname, 'dummy.jpg'), 'fake image data');
  });

  afterAll(() => {
    fs.unlinkSync(path.join(__dirname, 'dummy.jpg'));
  });

  it('should allow file upload with valid token', async () => {
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', path.join(__dirname, 'dummy.jpg'));
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'File uploaded successfully');
    expect(res.body.file).toHaveProperty('filename');
  });

  it('should reject file upload without token', async () => {
    const res = await request(app)
      .post('/api/upload');
    
    expect(res.statusCode).toEqual(401);
  });
});
