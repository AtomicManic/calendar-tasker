const { authenticateUser, authCallback } = require('../controllers/authController');
const router = require('express').Router();

router.get('/', authenticateUser);

router.get('/callback', authCallback);

module.exports = router;