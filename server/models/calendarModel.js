const Calendar = require('../schemas/calendarSchema');

const createCalendar = async (calendar) => {
    const newCalendar = await Calendar.create(calendar);
    return newCalendar;
}

const getCalendar = async (id) => {
    const calendar = await Calendar.findById(id);
    return calendar;
}

const getUserCalendars = async (userId) => {
    const calendars = await Calendar.find({ userId });
    return calendars;
}

const updateCalendar = async (id, calendar) => {
    const updatedCalendar = await Calendar.findByIdAndUpdate(id, calendar, { new: true });
    return updatedCalendar;
}

const deleteCalendar = async (id) => {
    const calendar = await Calendar.findByIdAndDelete(id);
    return calendar;
}

module.exports = {
    createCalendar,
    getCalendar,
    getUserCalendars,
    updateCalendar,
    deleteCalendar
}