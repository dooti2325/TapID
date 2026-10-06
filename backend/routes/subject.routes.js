const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subject.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

router.get('/', auth, subjectController.getAllSubjects);
router.post('/', auth, role('admin'), subjectController.addSubject);
router.put('/:id', auth, role('admin'), subjectController.updateSubject);
router.delete('/:id', auth, role('admin'), subjectController.deleteSubject);

module.exports = router;
