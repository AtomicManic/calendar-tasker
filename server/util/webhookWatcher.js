const WatchChannel = require('../schemas/watchChannelSchema');
const { setupWatchForAllCalendars } = require('../controllers/calendarWebhookController');
const { google } = require('googleapis');
const User = require('../schemas/userSchema');

const stopAllWatches = async () => {
    console.log("🛑 Stopping all active Google Calendar watches...");

    const activeWatches = await WatchChannel.find();

    if (activeWatches.length === 0) {
        console.log("✅ No active watches found.");
        return;
    }

    for (const watch of activeWatches) {
        try {
            if (!watch.userId) {
                console.warn(`⚠️ Invalid watch entry with missing userId: ${watch.channelId}. Removing from DB.`);
                await WatchChannel.deleteOne({ channelId: watch.channelId });
                continue;
            }

            // Fetch the user
            const user = await User.findOne({ googleId: watch.userId });
            if (!user || !user.refreshToken) {
                console.warn(`⚠️ No refresh token found for user ${watch.userId}. Skipping...`);
                continue;
            }

            // Authenticate with OAuth2
            const oauth2Client = new google.auth.OAuth2(
                process.env.CLIENT_ID,
                process.env.CLIENT_SECRET,
                process.env.REDIRECT_URI
            );
            oauth2Client.setCredentials({ refresh_token: user.refreshToken });

            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

            console.log(`⏳ Stopping watch for calendar ${watch.calendarId}...`);
            await calendar.channels.stop({
                requestBody: {
                    id: watch.channelId,
                    resourceId: watch.resourceId
                }
            });

            console.log(`✅ Stopped watch for calendar ${watch.calendarId}`);

            // Only delete if stopping was successful
            await WatchChannel.deleteOne({ channelId: watch.channelId });

        } catch (error) {
            console.error(`❌ Failed to stop watch for ${watch.calendarId}:`, error);
        }
    }

    console.log("✅ All active watches stopped.");
};

if (require.main === module) {
    stopAllWatches();
}

const removeExpiredWatches = async () => {
    const now = new Date();
    const deleted = await WatchChannel.deleteMany({ expiration: { $lt: now } });
    console.log(`🧹 Removed ${deleted.deletedCount} expired watches from database.`);
};

const restartWatches = async () => {
    console.log("🔄 Re-registering calendar watches...");
    try {
        await setupWatchForAllCalendars(); // Setup new watches for all users
        console.log("✅ Watches re-registered.");
    } catch (error) {
        console.error("❌ Failed to restart watches:", error);
    }
};

const cleanupWatchers = async () => {
    await removeExpiredWatches();
};

const shutdown = async () => {
    console.log("🛑 Server is shutting down. Stopping all calendar watches...");
    await stopAllWatches(); // Stop all active watches
    console.log("✅ All watches stopped. Exiting...");
    process.exit(0);
};

module.exports = { stopAllWatches, cleanupWatchers, shutdown };