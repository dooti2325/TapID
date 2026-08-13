const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', auth, deviceController.getAllDevices);
router.post('/status', deviceController.updateDeviceStatus); // Used by ESP32

module.exports = router;
