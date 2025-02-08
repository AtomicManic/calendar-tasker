const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const calendarSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    kind: {
        type: String,
        required: true,
        default: 'calendar#calendarListEntry'
    },
    etag: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true,
        unique: true
    },
    summary: {
        type: String,
        required: true
    },
    timeZone: {
        type: String,
        required: true
    },
    colorId: {
        type: String,
        required: true
    },
    backgroundColor: {
        type: String,
        required: true
    },
    foregroundColor: {
        type: String,
        required: true
    },
    accessRole: {
        type: String,
        required: true
    }
}, { collection: 'calendars' });

module.exports = mongoose.model('Calendar', calendarSchema);