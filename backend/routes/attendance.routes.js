const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const auth = require('../middleware/auth.middleware');

// Public route for ESP32
router.post('/record', attendanceController.recordAttendance);
router.post('/bulk-record', attendanceController.bulkRecordAttendance);

// Protected route for Faculty Dashboard
router.get('/session/:session_id', auth, attendanceController.getSessionAttendance);

module.exports = router;
