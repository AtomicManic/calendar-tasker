const { google } = require('googleapis');
const uuid = require('uuid');
const User = require('../models/userModel');
const WatchChannel = require('../schemas/watchChannelSchema');
const { oauth2Client } = require('../API/Google/Auth/auth');

const handleWebhook = async (req, res) => {
    const { headers } = req;

    if (headers['x-goog-resource-state'] !== 'exists') res.status(200).send('No updates');

    const channelId = headers['x-goog-channel-id'];
    const resourceId = headers['x-goog-resource-id'];
    const googleId = headers['x-goog-channel-token'];

    console.log(`🔔 Webhook received for channel ${channelId}, resource ${resourceId}, user ${googleId}`);

    const watchEntry = await WatchChannel.findOne({ channelId });
    if (!watchEntry) {
        console.error(`❌ Watch entry not found for channel ${channelId}`);
        return res.status(404).send();
    }
    console.log(`🔔 from watch entry id: ${watchEntry.channelId}, from header: ${channelId}`);

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
            updatedMin: new Date(Date.now() - 5 * 60000).toISOString(),
            singleEvents: true,
            orderBy: 'startTime'
        });
        console.log('Updated events:', events.data.items);

        await processCalendarUpdates(googleId, events.data.items);
        res.status(200).send();
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send();
    }

};

const setupWatchForUser = async (userId, calendarId, oauth2Client, summary) => {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 🛑 Check if there's an existing watch before creating a new one
    const existingWatch = await WatchChannel.findOne({ userId, calendarId });

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

        await WatchChannel.create({
            userId,
            calendarId,
            channelId: response.data.id,
            resourceId: response.data.resourceId,
            expiration: new Date(Number(response.data.expiration)),
            summary,
        });
        console.log(`✅ New watch created for calendar ${calendarId}`);
        return response.data;
    } catch (error) {
        console.error(`❌ Failed to setup watch for calendar ${calendarId}:`, error);
        return null;
    }
};

const setupWatchForAllCalendars = async (req, res) => {
    const { user } = req;
    console.log('googleId:', user.googleId);
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: user.accessToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
        const calendarList = await calendar.calendarList.list();
        const successfulWatches = [];

        for (const cal of calendarList.data.items) {
            const result = await setupWatchForUser(user.googleId, cal.id, oauth2Client, cal.summary);
            if (result) {
                successfulWatches.push(result);
            }
        }

        res.json(successfulWatches.length > 0 ? { successfulWatches } : { error: 'No watches were setup' });
    } catch (error) {
        console.error('Error setting up calendar watches:', error);
        throw error;
    }
};

const processCalendarUpdates = async (userId, events) => {
    console.log(`Processing ${events.length} events for user ${userId}`);
};


module.exports = {
    handleWebhook,
    setupWatchForAllCalendars,
};