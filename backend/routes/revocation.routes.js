const express = require('express');
const router = express.Router();
const revocationController = require('../controllers/revocation.controller');
const verifyToken = require('../middleware/auth.middleware');
const verifyRole = require('../middleware/role.middleware');

router.post('/card', verifyToken, verifyRole('admin'), revocationController.revokeCard);
router.post('/device', verifyToken, verifyRole('admin'), revocationController.revokeDevice);

module.exports = router;
