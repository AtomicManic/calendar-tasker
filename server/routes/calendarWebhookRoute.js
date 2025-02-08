const express = require('express');
const router = express.Router();
const { handleWebhook, setupWatchForAllCalendars, handleCalendarListWebhook } = require('../controllers/calendarWebhookController');
const authMiddleware = require('../middleware/auth');

router.post('/calendar', handleWebhook);
router.post('/setup', authMiddleware, setupWatchForAllCalendars);
router.post('/calendar-list', handleCalendarListWebhook);

module.exports = router;