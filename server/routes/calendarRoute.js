const { getCalendars, getEvents, getEventById } = require('../controllers/calendarController');
const authenticateJWT = require('../middleware/auth');
const router = require('express').Router();

router.get('/', authenticateJWT, getCalendars);
router.get('/events/:time(today|tomorrow|week-s|week-m|month|custom)/:calendarId', authenticateJWT, getEvents);
router.get('/events/:eventId/:calendarId', authenticateJWT, getEventById);

module.exports = router;