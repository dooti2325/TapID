const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/classroom.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

router.get('/', auth, ctrl.getAllClassrooms);
router.post('/', auth, role('admin'), ctrl.addClassroom);
router.put('/:id', auth, role('admin'), ctrl.updateClassroom);
router.delete('/:id', auth, role('admin'), ctrl.deleteClassroom);

module.exports = router;
