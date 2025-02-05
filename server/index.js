require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./db/dbConn');
const AuthRouter = require('./routes/authRoute');
const CalendarRouter = require('./routes/calendarRoute');
const TaskRouter = require('./routes/taskRoute');
const webhookRoutes = require('./routes/calendarWebhookRoute');
const { cleanupWatchers, shutdown } = require('./util/webhookWatcher');
const { corsConfig } = require('./config/cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsConfig));

connectDB();

app.use('/auth', AuthRouter);
app.use('/calendar', CalendarRouter);
app.use('/task', TaskRouter);
app.use('/webhook', webhookRoutes);

app.use(errorHandler);

cleanupWatchers();

process.on('SIGINT', shutdown);  // CTRL + C
process.on('SIGTERM', shutdown); // Termination signal (e.g., Docker, PM2)

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});