const { auth } = require('firebase-admin');
const authenticateJWT = require('../middleware/auth');
const { authenticateUser, authCallback } = require('../controllers/authController');
const router = require('express').Router();

router.get('/', authenticateUser);

router.get('/callback', authCallback);

router.get('/me', authenticateJWT, (req, res) => {
    res.send(req.user);
});

module.exports = router;