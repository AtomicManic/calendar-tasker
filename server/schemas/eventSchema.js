const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    calendarId: { type: mongoose.Schema.Types.ObjectId, ref: 'Calendar', required: true },
    kind: { type: String, required: true },
    etag: { type: String, required: true },
    id: { type: String, required: true, unique: true },
    status: { type: String, required: true },
    htmlLink: { type: String, required: true },
    created: { type: Date, required: true },
    updated: { type: Date, required: true },
    summary: { type: String, required: true },
    creator: {
        email: { type: String, required: true },
        self: { type: Boolean, required: true }
    },
    organizer: {
        email: { type: String, required: true },
        self: { type: Boolean, required: true }
    },
    start: {
        dateTime: { type: Date, required: true },
        timeZone: { type: String, required: true }
    },
    end: {
        dateTime: { type: Date, required: true },
        timeZone: { type: String, required: true }
    },

},{ collection: 'events' });

module.exports = mongoose.model('Event', eventSchema);