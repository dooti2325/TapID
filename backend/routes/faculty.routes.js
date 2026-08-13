const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/faculty.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

router.get('/', auth, role('admin'), facultyController.getAllFaculty);
router.post('/', auth, role('admin'), facultyController.addFaculty);
router.put('/:id', auth, role('admin'), facultyController.updateFaculty);
router.delete('/:id', auth, role('admin'), facultyController.deleteFaculty);

module.exports = router;
