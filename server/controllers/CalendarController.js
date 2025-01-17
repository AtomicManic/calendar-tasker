const { fetchPublicEvents } = require('../API/Google/Calendar/CalendarApi');

const getTodayEvents = async (req, res) => {
    try {
        const { accessToken } = req.user;
        const events = await fetchPublicEvents(accessToken);
        res.status(200).send(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send('Error fetching events');
    }
}

module.exports = { getTodayEvents };