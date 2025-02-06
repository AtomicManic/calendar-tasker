const { google } = require('googleapis');
const { oauth2Client } = require('../API/Google/Auth/auth');
const { createUser } = require('../models/userModel');
const { verifyUser, createCookie, createToken, getUserPhoneNumber } = require('../util/Auth');
const { getUserCalendars } = require('../API/Google/Calendar/calendarApi');
const UnauthorizedError = require('../errors/authErrors');
const ServerUnableError = require('../errors/internalErrors');

const SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
    'https://www.googleapis.com/auth/user.phonenumbers.read'
];

const authenticateUser = async (req, res, next) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent',
        include_granted_scopes: true
    });
    if (!authUrl) throw new UnauthorizedError('Failed to authenticate user');

    res.json({ authUrl });
}

const authCallback = async (req, res) => {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens) throw new UnauthorizedError('❌ Failed to authenticate user')

    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: 'v2'
    });

    const userInfo = await oauth2.userinfo.get();
    if (!userInfo) throw new ServerUnableError('create user');

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
        if (!newUser) throw new ServerUnableError('create user');
    }

    const jwtToken = await createToken({ email: data.email, accessToken: tokens.access_token, googleId: data.id });
    if (!jwtToken) throw new UnauthorizedError('❌ Failed to authenticate user');

    createCookie(res, jwtToken);
    res.redirect('http://localhost:5173/auth-success');
}


module.exports = { authenticateUser, authCallback };