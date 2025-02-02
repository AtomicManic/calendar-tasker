const { decodeJWT, createToken } = require('../util/Auth');
const { getUserByEmail } = require('../models/userModel');
const { google } = require('googleapis');

const authenticateJWT = async (req, res, next) => {
    const token = req.cookies.auth;
    console.log('authToken: ', req.cookies.auth);
    if (!token) {
        return res.status(401).send('Access denied!');
    }

    let decoded;
    try {
        decoded = decodeJWT(token);
        console.log('Decoded token:', decoded);
        req.user = decoded;
        return next();
    } catch (error) {
        if (error.name !== 'TokenExpiredError') {
            // If it's not a token expiration error, respond with an error
            console.error('Token verification failed:', error);
            return res.status(400).send('Invalid token.');
        }
    }

    try {
        decoded = decodeJWT(token);
        const userEmail = decoded.email;
        const user = await getUserByEmail(userEmail);
        if (!user || !user.refreshToken) {
            return res.status(401).send('Access Denied: No valid refresh token found.');
        }
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ refresh_token: user.refreshToken });
        const { credentials } = await oauth2Client.refreshAccessToken();
        const newAccessToken = credentials.access_token;
        const newJwtToken = createToken({ email: userEmail, accessToken: newAccessToken, googleId: user.googleId });
        createCookie(res, newJwtToken);
        req.user = decodeJWT(newJwtToken);
        return next();
    } catch (error) {
        console.error('Failed to refresh access token:', error);
        return res.status(401).send('Access Denied: Refresh token invalid or expired.');
    }
}

module.exports = authenticateJWT;