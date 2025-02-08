const Event = require('../schemas/eventSchema');

const createEvent = async (event) => {
    const event = await Event.create(event);
    return event;
}

const createEvents = async (events) => {
    const events = await Event.insertMany(events);
    return events;
}

const getEvent = async (id) => {
    const event = await Event.findById({ id });
    return event;
}

const getCalendarEvents = async (calendarId) => {
    const events = await Event.find(calendarId);
    return events;
}

const updateEvent = async (id, event) => {
    const updatedEvent = await Event.findByIdAndUpdate(id, event, { new: true });
    return updatedEvent;
}

const deleteEvent = async (id) => {
    const event = await Event.findByIdAndDelete(id);
    return event;
}

module.exports = {
    createEvent,
    createEvents,
    getEvent,
    getCalendarEvents,
    updateEvent,
    deleteEvent
}