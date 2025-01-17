require('dotenv').config();
const express = require('express');
const cors = require('cors');
const AuthRouter = require('./routes/AuthRoute');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use('/auth', AuthRouter);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});