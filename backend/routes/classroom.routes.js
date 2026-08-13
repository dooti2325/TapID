const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroom.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', auth, classroomController.getAllClassrooms);

module.exports = router;
