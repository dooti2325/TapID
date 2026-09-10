const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const auth = require('../middleware/auth.middleware');
const deviceAuth = require('../middleware/deviceAuth.middleware');
const { validateAttendanceTap } = require('../middleware/validation.middleware');

// Hardware routes for ESP32 with Device Authentication
router.post('/record', deviceAuth, validateAttendanceTap, attendanceController.recordAttendance);
router.post('/bulk-record', deviceAuth, attendanceController.bulkRecordAttendance);

// Protected route for Faculty Dashboard
router.get('/session/:session_id', auth, attendanceController.getSessionAttendance);

module.exports = router;
