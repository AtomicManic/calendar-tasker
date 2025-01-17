const { google } = require('googleapis');
const { oauth2Client } = require('../Auth/Auth');

// Initialize the Calendar API client
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Your API key (from Google Cloud Console)
const API_KEY = process.env.GOOGLE_API_KEY;

// Function to fetch events from a public calendar
const fetchPublicEvents = async () => {
    try {
        const response = await calendar.events.list({
            calendarId: 'primary', // For authenticated access, this would be the user's calendar
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
            key: API_KEY, // Use your API key
        });

        const events = response.data.items;

        if (events.length) {
            console.log('Upcoming events:');
            events.forEach((event) => {
                const start = event.start.dateTime || event.start.date;
                console.log(`${start} - ${event.summary}`);
            });
        } else {
            console.log('No upcoming events found.');
        }

        return events;
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

module.exports = { fetchPublicEvents };
