const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const auth = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rate_limit');

router.post('/login', authLimiter, authController.login);
router.put('/password', auth, authController.updatePassword);
router.post('/change-password', auth, authController.updatePassword);
router.put('/change-password', auth, authController.updatePassword);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);

module.exports = router;
