const {
  fetchPublicEvents,
  getUserCalendars,
  fetchEventById,
} = require("../API/Google/Calendar/calendarApi");
const { google } = require("googleapis");
const ServerUnableError = require("../errors/internalErrors");
const { EntityNotFound, PropertyNotFound } = require("../errors/notFoundErrors");

const getEvents = async (req, res) => {
  const { accessToken } = req.user;
  const { time, calendarId } = req.params;
  if (!time) throw new PropertyNotFound("time");
  if (!calendarId) throw new PropertyNotFound("calendarId");

  const events = await fetchPublicEvents(accessToken, time, calendarId);
  if (!events) throw new EntityNotFound("Events");

  res.status(200).json(events);
};

const getEventById = async (req, res) => {
  const { accessToken } = req.user;
  const { eventId, calendarId } = req.params;
  if (!eventId) throw new PropertyNotFound("event Id");
  if (!calendarId) throw new PropertyNotFound("calendar Id");

  const event = await fetchEventById(accessToken, eventId, calendarId);
  if (!event) throw new EntityNotFound("Event");

  res.status(200).json(event);
};

const getCalendars = async (req, res) => {
  const { accessToken } = req.user;
  const calendars = await getUserCalendars(accessToken);
  if (!calendars) throw new EntityNotFound("Calendars");

  let calendarsData = [];
  calendars.forEach((calendar) => {
    calendarsData.push({
      id: calendar.id,
      name: calendar.summary,
      color: calendar.backgroundColor,
    });
  });

  res.status(200).json(calendarsData);
};

module.exports = { getEvents, getCalendars, getEventById };
