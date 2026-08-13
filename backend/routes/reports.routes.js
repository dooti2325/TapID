const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', auth, reportsController.getAttendanceReport);
router.get('/attendance', auth, reportsController.getAttendanceReport);

module.exports = router;
