const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const verifyRole = require('../middleware/role.middleware');
const db = require('../config/database');
const logger = require('../config/logger');

// GET /api/analytics/summary
// Endpoint to return key metrics for the Admin Dashboard
router.get('/summary', verifyToken, verifyRole('admin'), async (req, res) => {
  try {
    const [studentsResult] = await db.execute('SELECT COUNT(*) as total FROM students');
    const totalStudents = studentsResult[0].total;

    const [teachersResult] = await db.execute(
      "SELECT COUNT(*) as total FROM users WHERE role = 'faculty'"
    );
    const totalTeachers = teachersResult[0].total;

    const [classesResult] = await db.execute('SELECT COUNT(*) as total FROM subjects');
    const totalClasses = classesResult[0].total;

    const [attendanceResult] = await db.execute(`
      SELECT 
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
        COUNT(*) as total_count
      FROM attendance
    `);
    
    let attendanceRate = 0;
    if (attendanceResult[0].total_count > 0) {
      attendanceRate = Math.round((attendanceResult[0].present_count / attendanceResult[0].total_count) * 100);
    }

    res.json({
      totalStudents,
      totalTeachers,
      totalClasses,
      attendanceRate
    });
  } catch (error) {
    logger.error('Error fetching analytics summary: ' + error.message);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

module.exports = router;
