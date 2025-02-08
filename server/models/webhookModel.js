const WatchChannel = require('../schemas/watchChannelSchema');

const findWatcherByChannelId = async (channelId) => {
    const watchEntry = await WatchChannel.findOne({ channelId });
    return watchEntry;
}

const findWatcherByUserAndCalendarId = async (userId, calendarId) => {
    const watchEntry = await WatchChannel.findOne({ userId, calendarId });
    return watchEntry;
}

const createWatcher = async (userId, calendarId, channelId, resourceId, summary, expiration) => {
    const watchEntry = new WatchChannel({
        userId,
        calendarId,
        channelId,
        resourceId,
        expiration: new Date(Number(expiration)),
        summary,
        lastSyncTime: new Date(),
    });
    await watchEntry.save();
}

const updateLastSyncTime = async (channelId) => {
    await WatchChannel.updateOne({ channelId }, { lastSyncTime: Date.now() });
}

module.exports = { findWatcherByChannelId, findWatcherByUserAndCalendarId, createWatcher, updateLastSyncTime };