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
    if (timeRange === ':time') throw new PropertyNotFound('time range');
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

    if (allEvents.length) logEventsSummary(allEvents);

    return allEvents;
};

const getUserCalendars = async (accessToken) => {
        const calendar = initCalendarClient(accessToken);
        const response = await calendar.calendarList.list();
        if(!response) throw new ServerUnableError('get calendars');
        return response.data.items;
}


// Helper function to get time range for events
const logEventsSummary = (events) => {
    events.forEach((event) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
    });
}

module.exports = { fetchPublicEvents, getUserCalendars, fetchEventById };
