const { google } = require('googleapis');
const { oauth2Client } = require('../API/Google/Auth/auth');
const { createUser } = require('../models/userModel');
const { verifyUser, createCookie, decodeJWT, createToken, getUserPhoneNumber } = require('../util/Auth');
const { getUserCalendars } = require('../API/Google/Calendar/calendarApi');

const SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
    'https://www.googleapis.com/auth/user.phonenumbers.read'
];

const authenticateUser = async (req, res) => {
    try {
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            prompt: 'consent', // Force consent screen to ensure refresh token
            include_granted_scopes: true // Enable incremental authorization
        });
        res.send({ authUrl });
        console.log(`Visit this URL to authenticate: ${authUrl}`);
    } catch (error) {
        console.error('Authentication URL generation failed:', error);
        res.status(500).send('Failed to authenticate!');
    }
}

const authCallback = async (req, res) => {
    console.log('Auth callback hit');
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
        const phoneNumber = await getUserPhoneNumber(tokens.access_token);

        let newUser = null;
        if (!isVerified) {
            newUser = await createUser({
                googleId: data.id,
                first_name: data.given_name,
                last_name: data.family_name,
                refreshToken: tokens.refresh_token,
                email: data.email,
                phoneNumber,
                calendars: calendars,
                createdAt: new Date()
            });
            console.log();
        }

        const jwtToken = await createToken({ email: data.email, accessToken: tokens.access_token, googleId: data.id });
        console.log('accessToken:', tokens.access_token);
        console.log('jwtToken:', jwtToken);
        createCookie(res, jwtToken);

        res.redirect('http://localhost:5173/auth-success');

    } catch (error) {
        console.error('Error during authentication:', error);
        res.redirect('http://localhost:5173/login');
    }
}


module.exports = { authenticateUser, authCallback };