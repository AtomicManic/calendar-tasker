const express = require('express');
const router = express.Router();
const { handleWebhook, setupWatchForAllCalendars } = require('../controllers/calendarWebhookController');
const authMiddleware = require('../middleware/auth');

router.post('/calendar', handleWebhook);
router.post('/setup', authMiddleware, setupWatchForAllCalendars);

module.exports = router;