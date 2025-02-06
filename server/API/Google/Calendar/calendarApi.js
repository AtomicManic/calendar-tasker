const initCalendarClient = require('./calendarClient');
const { getTimeRange } = require('../../../util/timeZoneOffset');
const { PropertyNotFound } = require('../../../errors/notFoundErrors');
const { ServerUnableError } = require('../../../errors/internalErrors');

const fetchEventById = async (accessToken, eventId, calendarId) => {
    const calendar = initCalendarClient(accessToken);
    const response = await calendar.events.get({
        calendarId: calendarId || 'primary',
        eventId
    });
    return response.data;
}

const fetchPublicEvents = async (accessToken, timeRange, calendarId, timeZone) => {
    const calendar = initCalendarClient(accessToken);
    const timeConstraints = getTimeRange(timeRange, timeZone);

    let allEvents = [];
    let nextPageToken = null;
    if (calendarId === ':calendarId') throw new PropertyNotFound('calendar id')

    do {
        const response = await calendar.events.list({
            calendarId: calendarId,
            timeMin: timeConstraints.timeMin,
            timeMax: timeConstraints.timeMax,
            maxResults: 10,  // Fetch 50 events per request
            singleEvents: true,
            orderBy: 'startTime',
            pageToken: nextPageToken // Get next page if available
        });

        if (!response.data.items) throw new ServerUnableError('get events')

        if (response.data.items && response.data.items.length > 0) {
            allEvents = allEvents.concat(response.data.items); // Append new results
        }

        nextPageToken = response.data.nextPageToken || null; // Update token for next call

    } while (nextPageToken); // Continue until all pages are fetched

    if (allEvents.length) {
        console.log(`${timeRange}'s events:`);
        allEvents.forEach((event) => {
            const start = event.start.dateTime || event.start.date;
            console.log(`${start} - ${event.summary}`);
        });
    } else {
        console.log('No upcoming events found.');
    }

    return allEvents;
};

const getUserCalendars = async (accessToken) => {
    try {
        const calendar = initCalendarClient(accessToken);
        const response = await calendar.calendarList.list();
        const calendars = response.data.items;
        return calendars;
    } catch (error) {
        console.error('Error fetching calendars:', error);
        res.status(500).send('Error fetching calendars');
    }
}


// Helper function to get time range for events


module.exports = { fetchPublicEvents, getUserCalendars, fetchEventById };
