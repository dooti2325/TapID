const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

router.get('/', auth, studentController.getAllStudents);
router.get('/my/attendance', auth, studentController.getStudentAttendance);
router.get('/:id/attendance', auth, studentController.getStudentAttendance);
router.post('/', auth, role('admin'), studentController.addStudent);
router.put('/:id', auth, role('admin'), studentController.updateStudent);
router.delete('/:id', auth, role('admin'), studentController.deleteStudent);

module.exports = router;
