const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const auth = require('../middleware/auth.middleware');

router.post('/login', authController.login);
router.put('/password', auth, authController.updatePassword);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);

module.exports = router;
