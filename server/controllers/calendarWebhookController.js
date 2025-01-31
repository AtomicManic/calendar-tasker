const { google } = require('googleapis');
const uuid = require('uuid');
const User = require('../models/userModel');
const WatchChannel = require('../schemas/watchChannelSchema');

const handleWebhook = async (req, res) => {
    const { headers } = req;

    if (headers['x-goog-resource-state'] === 'exists') {
        const calendarId = headers['x-goog-resource-id'];
        const userId = headers['x-goog-channel-token'];

        const user = await User.getUserById(userId);
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: user.accessToken });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        try {
            const events = await calendar.events.list({
                calendarId,
                updatedMin: new Date(Date.now() - 5 * 60000).toISOString(),
                singleEvents: true,
                orderBy: 'startTime'
            });

            await processCalendarUpdates(userId, events.data.items);
            res.status(200).send();
        } catch (error) {
            console.error('Error processing webhook:', error);
            res.status(500).send();
        }
    } else {
        res.status(200).send();
    }
};

const setupWatchForUser = async (userId, calendarId, oauth2Client) => {
    // Skip known unsupported calendars
    if (calendarId.includes('holiday@group.v.calendar.google.com')) {
        console.log(`Skipping holiday calendar: ${calendarId}`);
        return null;
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
        const response = await calendar.events.watch({
            calendarId,
            requestBody: {
                id: uuid.v4(),
                type: 'web_hook',
                address: `${process.env.WEBHOOK_URL}/webhook/calendar`,
                token: userId,
            }
        });

        await WatchChannel.create({
            userId,
            calendarId,
            channelId: response.data.id,
            resourceId: response.data.resourceId,
            expiration: new Date(Number(response.data.expiration))
        });

        return response.data;
    } catch (error) {
        console.error(`Failed to setup watch for calendar ${calendarId}:`, error);
        return null; // Return null instead of throwing
    }
};

const setupWatchForAllCalendars = async (req, res) => {
    const { user } = req;
    const oauth2Client = new google.auth.OAuth2();
    console.log('user.accessToken:', user.accessToken);
    oauth2Client.setCredentials({ access_token: user.accessToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
        const calendarList = await calendar.calendarList.list();
        console.log('calendarList:', calendarList);
        const successfulWatches = [];

        for (const cal of calendarList.data.items) {
            const result = await setupWatchForUser(user.id, cal.id, oauth2Client);
            if (result) {
                successfulWatches.push(result);
                console.log('calendar:', cal);
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
    setupWatchForAllCalendars
};