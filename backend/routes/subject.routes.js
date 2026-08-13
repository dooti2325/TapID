const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subject.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', auth, subjectController.getAllSubjects);
router.post('/', auth, subjectController.addSubject);
router.put('/:id', auth, subjectController.updateSubject);
router.delete('/:id', auth, subjectController.deleteSubject);

module.exports = router;
