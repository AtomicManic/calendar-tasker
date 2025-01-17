const { getTodayEvents } = require('../controllers/CalendarController');
const authenticateJWT = require('../middleware/jwt');
const router = require('express').Router();

router.get('/today', authenticateJWT, getTodayEvents);

module.exports = router;