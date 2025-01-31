require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./db/dbConn');
const AuthRouter = require('./routes/authRoute');
const CalendarRouter = require('./routes/calendarRoute');
const TaskRouter = require('./routes/taskRoute');
const webhookRoutes = require('./routes/calendarWebhookRoute');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

connectDB();

app.use('/auth', AuthRouter);
app.use('/calendar', CalendarRouter);
app.use('/task', TaskRouter);
app.use('/webhook', webhookRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});