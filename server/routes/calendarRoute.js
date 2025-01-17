const { getCalendars, getEvents, getEventById } = require('../controllers/calendarController');
const authenticateJWT = require('../middleware/jwt');
const router = require('express').Router();

router.get('/events/:time/:calendarId', authenticateJWT, getEvents);
router.get('/calendars', authenticateJWT, getCalendars);
router.get('/events/:eventId/:calendarId', authenticateJWT, getEventById);

module.exports = router;