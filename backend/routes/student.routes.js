const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', auth, studentController.getAllStudents);
router.post('/', auth, studentController.addStudent);
router.put('/:id', auth, studentController.updateStudent);
router.delete('/:id', auth, studentController.deleteStudent);

module.exports = router;
