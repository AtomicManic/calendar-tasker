
const axios = require('axios');

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_STOP_WATCH_URL = "https://www.googleapis.com/calendar/v3/channels/stop";

// **🔥 Hardcoded list of active watches (replace this with your data)**
const activeWatches = [
    { channelId: "3526cfa4-43d4-4406-a80f-a87ed823e0d9", resourceId: "YWOESQMT15uQ2TtMsJ7zYfuuW4E" },
    { channelId: "8da7e320-0fbd-48a9-8df3-180f8e0eee3e", resourceId: "YWOESQMT15uQ2TtMsJ7zYfuuW4E" },
    { channelId: "955b8e94-827d-453a-adea-8010ea25b6ee", resourceId: "YWOESQMT15uQ2TtMsJ7zYfuuW4E" },
    { channelId: "fbe0bdf3-b705-4224-b1e3-2c43978b42e6", resourceId: "YWOESQMT15uQ2TtMsJ7zYfuuW4E" },
    { channelId: "5867b473-4dff-41b6-a69c-0f43e4732dfa", resourceId: "YWOESQMT15uQ2TtMsJ7zYfuuW4E" },
    { channelId: "7253e4d6-1811-46b3-80b6-f9c5ff58eebe", resourceId: "YWOESQMT15uQ2TtMsJ7zYfuuW4E" },
    { channelId: "83340691-2272-4300-93ea-4015418a9c15", resourceId: "YWOESQMT15uQ2TtMsJ7zYfuuW4E" },
    { channelId: "ea465d93-a43f-4757-af02-06c65e3bc66f", resourceId: "YWOESQMT15uQ2TtMsJ7zYfuuW4E" },
    { channelId: "fed44435-7da9-4554-8e71-961a5b6de138", resourceId: "YWOESQMT15uQ2TtMsJ7zYfuuW4E" },
    { channelId: "1fbe0ce6-793c-497f-a2bc-8222d392453e", resourceId: "YWOESQMT15uQ2TtMsJ7zYfuuW4E" },
    { channelId: "8d5acf54-7b42-4709-ad6e-e1ec72175530", resourceId: "YWOESQMT15uQ2TtMsJ7zYfuuW4E" },
    { channelId: "d5ca0b83-4fe2-4d93-b97c-c5b7bcc5c61b", resourceId: "YWOESQMT15uQ2TtMsJ7zYfuuW4E" },
    { channelId: "3d4aa7d2-e979-4106-ac96-8360e45d62b0", resourceId: "YWOESQMT15uQ2TtMsJ7zYfuuW4E" },
    { channelId: "845dd67b-5332-4f9b-8d64-38406cd8651c", resourceId: "YWOESQMT15uQ2TtMsJ7zYfuuW4E" },
    { channelId: "74f45667-7336-407a-be31-b0c02ff700e9", resourceId: "YWOESQMT15uQ2TtMsJ7zYfuuW4E" },
    { channelId: "f059dd1f-78fa-44fc-af23-46ef8eeebab4", resourceId: "YWOESQMT15uQ2TtMsJ7zYfuuW4E" },
    { channelId: "5b4e1d97-6f59-4547-bf7b-96ddafc39c73", resourceId: "YWOESQMT15uQ2TtMsJ7zYfuuW4E" },
    { channelId: "f9b1361d-fa21-4584-b8c2-ce99b240c7a7", resourceId: "YWOESQMT15uQ2TtMsJ7zYfuuW4E" },
    { channelId: "169a6fea-ca36-40c0-b45b-6452f91e03c4", resourceId: "YWOESQMT15uQ2TtMsJ7zYfuuW4E" },
    { channelId: "d5810017-ffd1-4155-a2f2-e0f503913dca", resourceId: "YWOESQMT15uQ2TtMsJ7zYfuuW4E" }
];






// **🔥 Replace this with your refresh token (from OAuth setup)**
// const REFRESH_TOKEN = "YOUR_REFRESH_TOKEN_HERE";

const refreshAccessToken = async () => {
    try {
        const response = await axios.post(GOOGLE_TOKEN_URL, {
            client_id: '750591600143-ugu461bl50mspot207nmnist74rt67dq.apps.googleusercontent.com',
            client_secret: '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',
            refresh_token: '1//03yRk1q_ZLf5GCgYIARAAGAMSNwF-L9IrMpZ0XTqSYHf1iq1Z7GS-c_U0YGKXVgHMyB7qoO3O-DOBNC1EyqLMh_yfGEsPSqdqMj4',
            grant_type: "refresh_token",
        });

        return response.data.access_token;
    } catch (error) {
        console.error("❌ Error refreshing access token:", error.response?.data || error.message);
        return null;
    }
};

const stopWatch = async (accessToken, channelId, resourceId) => {
    try {
        await axios.post(
            GOOGLE_STOP_WATCH_URL,
            { id: channelId, resourceId: resourceId },
            { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
        );

        console.log(`✅ Successfully stopped watch: ${channelId}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to stop watch ${channelId}:`, error.response?.data || error.message);
        return false;
    }
};

const stopAllWatches = async () => {
    console.log("🛑 Stopping all active Google Calendar watches...");

    const accessToken = await refreshAccessToken();
    if (!accessToken) {
        console.log("❌ Could not obtain access token. Exiting.");
        return;
    }

    for (const watch of activeWatches) {
        await stopWatch(accessToken, watch.channelId, watch.resourceId);
    }

    console.log("✅ All active watches stopped.");
};

// **Run the function**
stopAllWatches();
