const { decodeJWT, createToken } = require('../util/Auth');
const { getUserByEmail } = require('../models/userModel');
const { google } = require('googleapis');
const { UnauthorizedError } = require('../errors/authErros');

const authenticateJWT = async (req, res, next) => {
    const token = req.cookies.auth;
    if (!token) {
        return res.status(401).send('Access denied!');
    }

    let decoded;
    try {
        decoded = decodeJWT(token);
        req.user = decoded;
        return next();
    } catch (error) {
        if (error.name !== 'TokenExpiredError') {
            // If it's not a token expiration error, respond with an error
            return res.status(400).send('Invalid token.');
        }
    }

    decoded = decodeJWT(token);
    const userEmail = decoded.email;
    const user = await getUserByEmail(userEmail);
    if (!user || !user.refreshToken) throw new UnauthorizedError('❌ User not found or refresh token not set');

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ refresh_token: user.refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();
    if (!credentials) throw new UnauthorizedError('❌ Failed to refresh access token');

    const newAccessToken = credentials.access_token;
    const newJwtToken = createToken({ email: userEmail, accessToken: newAccessToken, googleId: user.googleId });
    createCookie(res, newJwtToken);
    req.user = decodeJWT(newJwtToken);

    return next();
}

module.exports = authenticateJWT;