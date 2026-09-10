const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/device.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const deviceAuth = require('../middleware/deviceAuth.middleware');

router.get('/', auth, ctrl.getAllDevices);
router.post('/', auth, role('admin'), ctrl.addDevice);
router.post('/status', deviceAuth, ctrl.updateDeviceStatus);
router.put('/:id/classroom', auth, role('admin'), ctrl.assignClassroom);
router.delete('/:id', auth, role('admin'), ctrl.deleteDevice);

module.exports = router;
