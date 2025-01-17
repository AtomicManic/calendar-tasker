const { getCalendars, getEvents } = require('../controllers/CalendarController');
const authenticateJWT = require('../middleware/jwt');
const router = require('express').Router();

router.get('/events/:time/:calendarId', authenticateJWT, getEvents);
router.get('/calendars', authenticateJWT, getCalendars);

module.exports = router;