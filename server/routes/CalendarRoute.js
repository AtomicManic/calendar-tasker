const { getTodayEvents } = require('../controllers/CalendarController');
const router = require('express').Router();

router.get('/today', getTodayEvents);

module.exports = router;