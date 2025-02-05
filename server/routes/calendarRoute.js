const { getCalendars, getEvents, getEventById } = require('../controllers/calendarController');
const authenticateJWT = require('../middleware/auth');
const router = require('express').Router();

router.get('/events/:time/:calendarId', authenticateJWT, getEvents);
router.get('/', authenticateJWT, getCalendars);
router.get('/events/:eventId/:calendarId', authenticateJWT, getEventById);

module.exports = router;