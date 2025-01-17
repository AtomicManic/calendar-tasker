const { google } = require('googleapis');
const { oauth2Client } = require('../API/Google/Auth/Auth');

const authenticateUser = async (req, res) => {
    try {
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline', // Ensures refresh token is provided
            scope: ['https://www.googleapis.com/auth/calendar.readonly'], // Request Calendar API access
        });
        res.send(`<a href="${authUrl}">Authenticate with Google</a>`);
        console.log(`Visit this URL to authenticate: ${authUrl}`);
    } catch (error) {

    }
}

const authCallback = async (req, res) => {
    const { code } = req.query;

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        res.send('Authentication successful! You can close this tab.');
        console.log('Tokens:', tokens);

    } catch (error) {
        console.error('Error during authentication:', error);
        res.status(500).send('Authentication failed!');
    }
}

module.exports = { authenticateUser, authCallback };