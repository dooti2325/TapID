const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/sections.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

router.get('/', auth, ctrl.getAllSections);
router.post('/', auth, role('admin'), ctrl.addSection);
router.put('/:id', auth, role('admin'), ctrl.updateSection);
router.delete('/:id', auth, role('admin'), ctrl.deleteSection);

module.exports = router;
