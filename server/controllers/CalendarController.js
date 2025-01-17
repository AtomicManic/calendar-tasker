const { fetchPublicEvents, getUserCalendars } = require('../API/Google/Calendar/CalendarApi');
const { google } = require('googleapis');

const getEvents = async (req, res) => {
    const { time, calendarId } = req.params;
    try {
        const { accessToken } = req.user;
        const events = await fetchPublicEvents(accessToken, time, calendarId);
        res.status(200).send(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send('Error fetching events');
    }
}

const getCalendars = async (req, res) => {
    try {
        const { accessToken } = req.user;
        const calendars = await getUserCalendars(accessToken);
        res.status(200).send(calendars);
    } catch (error) {
        console.error('Error fetching calendars:', error);
        res.status(500).send('Error fetching calendars');
    }
}



module.exports = { getEvents, getCalendars };