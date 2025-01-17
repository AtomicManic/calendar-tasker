const initCalendarClient = require('./calendarClient');

const fetchEventById = async (accessToken, eventId, calendarId) => {
    const calendar = initCalendarClient(accessToken);
    const response = await calendar.events.get({
        calendarId: calendarId ? calendarId : 'primary',
        eventId: eventId
    });
}

const fetchPublicEvents = async (accessToken, timeRange, calendarId) => {
    try {
        const calendar = initCalendarClient(accessToken);

        const timeConstraints = getTimeRange(timeRange);

        const response = await calendar.events.list({
            calendarId: calendarId ? calendarId : 'primary', // For authenticated access, this would be the user's calendar
            timeMin: timeConstraints.timeMin,
            timeMax: timeConstraints.timeMax,
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
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
const getTimeRange = (timeRange) => {
    const now = new Date();
    const timeMin = new Date();
    const timeMax = new Date();

    switch (timeRange) {
        case 'today':
            timeMin.setHours(0, 0, 0, 0);
            timeMax.setHours(23, 59, 59, 999);
            break;
        case 'tomorrow':
            timeMin.setDate(now.getDate() + 1);
            timeMin.setHours(0, 0, 0, 0);
            timeMax.setDate(now.getDate() + 1);
            timeMax.setHours(23, 59, 59, 999);
            break;
        case 'week':
            timeMin.setHours(0, 0, 0, 0);
            timeMax.setDate(now.getDate() + 7);
            timeMax.setHours(23, 59, 59, 999);
            break;
        case 'month':
            timeMin.setHours(0, 0, 0, 0);
            timeMax.setMonth(now.getMonth() + 1);
            timeMax.setHours(23, 59, 59, 999);
            break;
        default:
            timeMin.setHours(0, 0, 0, 0);
            timeMax.setHours(23, 59, 59, 999);
    }

    return {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString()
    };
};

module.exports = { fetchPublicEvents, getUserCalendars, fetchEventById };
