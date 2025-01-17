const { google } = require('googleapis');
const { oauth2Client } = require('../API/Google/Auth/Auth');
const { createUser } = require('../models/userModel');
const { verifyUser, createCookie, decodeJWT, createToken } = require('../util/Auth');
const { getUserCalendars } = require('../API/Google/Calendar/CalendarApi');

const SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/calendar.calendarlist.readonly'
];

const authenticateUser = async (req, res) => {
    try {
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            prompt: 'consent', // Force consent screen to ensure refresh token
            include_granted_scopes: true // Enable incremental authorization
        });
        res.send(`<a href="${authUrl}">Authenticate with Google</a>`);
        console.log(`Visit this URL to authenticate: ${authUrl}`);
    } catch (error) {
        console.error('Authentication URL generation failed:', error);
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
        const calendars = await getUserCalendars(tokens.access_token);
        console.log('calendars:', calendars);

        if (!isVerified) {
            await createUser({
                first_name: data.given_name,
                last_name: data.family_name,
                refreshToken: tokens.refresh_token,
                email: data.email,
                calendars: calendars,
                createdAt: new Date()
            });
        }
        // save access token to jwt
        const jwtToken = createToken({ email: data.email, accessToken: tokens.access_token });
        console.log('accessToken:', tokens.access_token);
        console.log('jwtToken:', jwtToken);
        createCookie(res, jwtToken);

        res.send('Authentication successful! You can close this tab.');

    } catch (error) {
        console.error('Error during authentication:', error);
        res.status(500).send('Authentication failed!');
    }
}

module.exports = { authenticateUser, authCallback };