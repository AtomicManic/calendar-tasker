const { google } = require('googleapis');

const initCalendarClient = (accessToken) => {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    return calendar;
}

module.exports = initCalendarClient;