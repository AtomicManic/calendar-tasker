const mongoose = require('mongoose');

const watchChannelSchema = new mongoose.Schema({
    userId: String,
    calendarId: String,
    channelId: String,
    resourceId: String,
    expiration: Date,
    summary: String,
    lastSyncTime: { type: Date, default: Date.now },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('WatchChannel', watchChannelSchema);