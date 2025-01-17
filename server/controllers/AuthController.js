const { google } = require('googleapis');
const { oauth2Client } = require('../API/Google/Auth/Auth');
const jwt = require('jsonwebtoken');
const { createUser, getUserById, updateUserById, deleteUserById, } = require('../models/userModel');
const { verifyUser, createCookie, decodeJWT, createToken } = require('../util/Auth');
const { create } = require('../schemas/userSchema');

const authenticateUser = async (req, res) => {
    try {
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline', // Ensures refresh token is provided
            scope: ['https://www.googleapis.com/auth/calendar.readonly', 'profile', 'email'], // Request Calendar API access
        });
        res.send(`<a href="${authUrl}">Authenticate with Google</a>`);
        console.log(`Visit this URL to authenticate: ${authUrl}`);
    } catch (error) {
        res.status(500).send('Failed to authenticate!');
    }
}

const authCallback = async (req, res) => {
    const { code } = req.query;

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        });

        const userInfo = await oauth2.userinfo.get();
        const { data } = userInfo;
        const isVerified = await verifyUser(data.email);

        if (!isVerified) {
            await createUser({
                first_name: data.given_name,
                last_name: data.family_name,
                refreshToken: tokens.refresh_token,
                email: data.email,
                createdAt: new Date()
            });
        }
        // save access token to jwt
        const jwtToken = createToken({ email: data.email, accessToken: tokens.access_token });
        createCookie(res, jwtToken);

        res.send('Authentication successful! You can close this tab.');

    } catch (error) {
        console.error('Error during authentication:', error);
        res.status(500).send('Authentication failed!');
    }
}

module.exports = { authenticateUser, authCallback };