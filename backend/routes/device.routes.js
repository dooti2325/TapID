const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/device.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

router.get('/', auth, ctrl.getAllDevices);
router.post('/', auth, role('admin'), ctrl.addDevice);
router.post('/status', ctrl.updateDeviceStatus); // Used by ESP32 (no auth)
router.put('/:id/classroom', auth, role('admin'), ctrl.assignClassroom);
router.delete('/:id', auth, role('admin'), ctrl.deleteDevice);

module.exports = router;
