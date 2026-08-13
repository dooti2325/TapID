const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const auth = require('../middleware/auth.middleware');

router.post('/start', auth, sessionController.startSession);
router.post('/end/:id', auth, sessionController.endSession);
router.post('/:id/end', auth, sessionController.endSession);
router.get('/active', auth, sessionController.getActiveSession);

module.exports = router;
