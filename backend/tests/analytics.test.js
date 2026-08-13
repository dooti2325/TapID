const request = require('supertest');
const app = require('../app');

jest.mock('../config/database', () => ({
  execute: jest.fn().mockResolvedValue([[{ total: 5, present_count: 4, total_count: 5 }]])
}));

describe('Analytics API', () => {
  let adminToken;
  let teacherToken;

  beforeAll(() => {
    const jwt = require('jsonwebtoken');
    adminToken = jwt.sign({ id: 1, role: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    teacherToken = jwt.sign({ id: 2, role: 'teacher' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  });

  it('should allow admin to fetch analytics', async () => {
    const res = await request(app)
      .get('/api/analytics/summary')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('totalStudents');
    expect(res.body).toHaveProperty('totalTeachers');
    expect(res.body).toHaveProperty('totalClasses');
    expect(res.body).toHaveProperty('attendanceRate');
  });

  it('should deny non-admin access to analytics', async () => {
    const res = await request(app)
      .get('/api/analytics/summary')
      .set('Authorization', `Bearer ${teacherToken}`);
    
    expect(res.statusCode).toEqual(403);
  });
});
