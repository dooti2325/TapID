const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

router.use(auth, role('admin'));

router.get('/stats', adminController.getDashboardStats);
router.get('/rfid-cards', adminController.getRfidCards);

module.exports = router;
