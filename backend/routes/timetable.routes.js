const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetable.controller');
const verifyToken = require('../middleware/auth.middleware');
const verifyRole = require('../middleware/role.middleware');

router.get('/', verifyToken, timetableController.getTimetable);
router.post('/', verifyToken, verifyRole('admin'), timetableController.addTimetable);
router.delete('/:id', verifyToken, verifyRole('admin'), timetableController.deleteTimetable);

module.exports = router;
