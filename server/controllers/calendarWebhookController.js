const { google } = require('googleapis');
const uuid = require('uuid');
const User = require('../models/userModel');
const WatchChannel = require('../schemas/watchChannelSchema');
const Watch = require('../models/webhookModel');
const { oauth2Client } = require('../API/Google/Auth/auth');

const handleWebhook = async (req, res) => {
    const { headers } = req;
    if (headers['x-goog-resource-state'] !== 'exists') res.status(200).send('No updates');

    const channelId = headers['x-goog-channel-id'];
    const resourceId = headers['x-goog-resource-id'];
    const googleId = headers['x-goog-channel-token'];

    console.log(`🔔 Webhook received for channel ${channelId}, resource ${resourceId}, user ${googleId}`);

    // const watchEntry = await WatchChannel.findOne({ channelId });
    const watchEntry = await Watch.findWatcherByChannelId(channelId);
    if (!watchEntry) {
        console.error(`❌ Watch entry not found for channel ${channelId} reasource ${resourceId}`);
        return res.status(404).send();
    }

    const { calendarId } = watchEntry;

    const user = await User.getUserByGoogleId(googleId);
    if (!user) {
        console.error(`No user found for googleId: ${googleId}`);
        return res.status(404).send('User not found');
    }

    oauth2Client.setCredentials({ refresh_token: user.refreshToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
        const events = await calendar.events.list({
            calendarId,
            updatedMin: watchEntry.lastSyncTime.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
            showDeleted: true,
        });
        console.log('Updated events:', events.data.items);
        await updateLastSyncTime(channelId);
        await processCalendarUpdates(googleId, events.data.items);
        res.status(200).send();
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send();
    }

};

const handleCalendarListWebhook = async (req, res) => {
    const { headers } = req;
    if (headers['x-goog-resource-state'] !== 'exists') res.status(200).send('No updates');

    const channelId = headers['x-goog-channel-id'];
    const resourceId = headers['x-goog-resource-id'];
    const googleId = headers['x-goog-channel-token'];

    console.log(`🔔 Calendar List Webhook received for channel ${channelId}, resource ${resourceId}, user ${googleId}`);

    const watchEntry = await Watch.findWatcherByChannelId(channelId);
    if (!watchEntry) {
        console.error(`❌ Watch entry not found for channel ${channelId}`);
        return res.status(404).send();
    }

    const user = await User.getUserByGoogleId(googleId);
    if (!user) {
        console.error(`No user found for googleId: ${googleId}`);
        return res.status(404).send('User not found');
    }

    oauth2Client.setCredentials({ refresh_token: user.refreshToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
        const calendars = await calendar.calendarList.list();
        console.log('Updated calendars:', calendars.data.items);
        await updateLastSyncTime(channelId);
        res.status(200).send();
    } catch (error) {
        console.error('Error processing calendar list webhook:', error);
        res.status(500).send();
    }
}

const setupWatchForUser = async (userId, calendarId, oauth2Client, summary) => {
    if (calendarId.includes('holiday@group.v.calendar.google.com')) {
        console.log(`Skipping holiday calendar: ${calendarId}`);
        return null;
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 🛑 Check if there's an existing watch before creating a new one
    const existingWatch = await Watch.findWatcherByUserAndCalendarId(userId, calendarId);
    if (existingWatch) {
        console.log(`⚠️ Watch already exists for calendar: ${calendarId}, skipping...`);
        return existingWatch;
    }

    const uniqueId = uuid.v4();
    try {
        const response = await calendar.events.watch({
            calendarId,
            requestBody: {
                id: uniqueId,
                type: 'web_hook',
                address: `${process.env.WEBHOOK_URL}/webhook/calendar`,
                token: userId,

            }
        });

        console.log(`Provided ID: ${uniqueId}, Returned ID: ${response.data.id}`);

        Watch.createWatcher(
            userId,
            calendarId,
            response.data.id,
            response.data.resourceId,
            summary,
            response.data.expiration
        );
        console.log(`✅ New watch created for calendar ${calendarId}`);
        return response.data;
    } catch (error) {
        console.error(`❌ Failed to setup watch for calendar ${calendarId}:`, error);
        return null;
    }
};

const setupWatchForAllCalendars = async (req, res) => {
    const { user } = req;
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: user.accessToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
        // Watch Events for all calendars
        const calendarList = await calendar.calendarList.list();
        const successfulWatches = [];

        for (const cal of calendarList.data.items) {
            const result = await setupWatchForUser(user.googleId, cal.id, oauth2Client, cal.summary);
            if (result) {
                successfulWatches.push(result);
            }
        }

        // Watch Calendar List
        const calendarListWatcher = await watchCalendarList(user.googleId, oauth2Client);
        if (calendarListWatcher) {
            successfulWatches.push(calendarListWatcher);
        }

        res.json(successfulWatches.length > 0 ? { successfulWatches } : { error: 'No watches were setup' });
    } catch (error) {
        console.error('Error setting up calendar watches:', error);
        throw error;
    }
};

const watchCalendarList = async (userId, oauth2Client) => {
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    try {
        const response = await calendar.calendarList.watch({
            requestBody: {
                id: `calendar-list-${userId}-${Date.now()}`,  // Unique ID for this watcher
                type: "web_hook",
                address: `${process.env.WEBHOOK_URL}/webhook/calendar-list`,  // Webhook to handle calendar list changes
                token: userId, // Helps identify the user when webhook is triggered
            },
        });

        console.log("✅ Calendar list watcher created:", response.data);

        // Store the watcher info in your database
        // await WatchChannel.create({
        //     userId,
        //     channelId: response.data.id,
        //     resourceId: response.data.resourceId,
        //     expiration: new Date(Number(response.data.expiration)),
        //     summary: "Calendar List Watcher",
        //     lastSyncTime: new Date(),
        // });
        await Watch.createWatcher(
            userId,
            null,
            response.data.id,
            response.data.resourceId,
            "Calendar List Watcher",
            response.data.expiration,
        );

        return response.data;
    } catch (error) {
        console.error("❌ Error setting up calendar list watcher:", error);
        return null;
    }
};

const processCalendarUpdates = async (userId, events) => {
    console.log('Processing updates for user:', userId);
};

const updateLastSyncTime = async (channelId) => {
    try {
        // WatchChannel.updateOne({ channelId }, { lastSyncTime: new Date() });
        Watch.updateLastSyncTime(channelId);
    } catch (error) {
        console.error('Error updating last sync time:', error);
    }
}


module.exports = {
    handleWebhook,
    setupWatchForAllCalendars,
    handleCalendarListWebhook
};