const {
  fetchPublicEvents,
  getUserCalendars,
  fetchEventById,
} = require("../API/Google/Calendar/calendarApi");
const { google } = require("googleapis");

const getEvents = async (req, res) => {
  const { time, calendarId } = req.params;
  try {
    const { accessToken } = req.user;
    const events = await fetchPublicEvents(accessToken, time, calendarId);
    res.status(200).send(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).send("Error fetching events");
  }
};

const getEventById = async (req, res) => {
  const { eventId, calendarId } = req.params;
  try {
    const { accessToken } = req.user;
    const event = await fetchEventById(accessToken, eventId, calendarId);
    res.status(200).send(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).send("Error fetching event");
  }
};

const getCalendars = async (req, res) => {
  try {
    const { accessToken } = req.user;
    const calendars = await getUserCalendars(accessToken);
    let calendarsData = [];
    calendars.forEach((calendar) => {
      calendarsData.push({
        id: calendar.id,
        name: calendar.summary,
        color: calendar.backgroundColor,
      });
    });
    res.status(200).send(calendarsData);
  } catch (error) {
    console.error("Error fetching calendars:", error);
    res.status(500).send("Error fetching calendars");
  }
};

module.exports = { getEvents, getCalendars, getEventById };
