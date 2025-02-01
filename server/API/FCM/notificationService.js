const { admin } = require('./firebase');
const User = require('../../models/userModel');

// Initialize Firebase Admin SDK


// Function to send push notifications
const sendPushNotification = async (googleId, notification) => {
    const user = await User.getUserByGoogleId(googleId);

    if (!user || !user.fcmToken) {
        console.error("❌ No FCM Token found for user", userId);
        return;
    }

    const message = {
        token: user.fcmToken,
        notification: { ...notification },
        android: { priority: "high" }
    };
    console.log(`📲 Sending notification to ${googleId}:`, notification);

    try {
        await admin.messaging().send(message);
        console.log(`✅ Notification sent to ${userId} for task "${notification.type}"`);
    } catch (error) {
        console.error("❌ Error sending notification:", error);
    }
};

const generateFCMToken = async (googleId) => {
    try {
        const registrationToken = await admin.auth().createCustomToken(googleId);
        return registrationToken;
    } catch (error) {
        console.error("❌ Error generating FCM token:", error);
        return null;
    }
};

module.exports = { sendPushNotification, generateFCMToken };
