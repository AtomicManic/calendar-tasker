const { google } = require('googleapis');

// Your API key (from Google Cloud Console)
const API_KEY = process.env.GOOGLE_API_KEY;

// Function to fetch events from a public calendar
const fetchPublicEvents = async (accessToken) => {
    try {
        console.log('accessToken', accessToken);
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        const response = await calendar.events.list({
            calendarId: 'primary', // For authenticated access, this would be the user's calendar
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
            key: API_KEY,
        });

        const events = response.data.items;

        if (events.length) {
            console.log('Upcoming events:');
            events.forEach((event) => {
                const start = event.start.dateTime || event.start.date;
                console.log(`${start} - ${event.summary}`);
            });
            return events || [];
        } else {
            console.log('No upcoming events found.');
        }

        return events;
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

module.exports = { fetchPublicEvents };
