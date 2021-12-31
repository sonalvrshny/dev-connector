// get express server running
const express = require('express');
const connectDB = require('./config/db');

// initialise app variable with express
const app = express();

// connect to db
connectDB();

// single endpoint to test
// send data to browser that API is running
app.get('/', (req, res) => res.send('API Running'));

// look for env variable called PORT or default to 5000 is no env variable is set
// this Port will be used when deploying to heroku
const PORT = process.env.PORT || 5000;

// listen on PORT
// callback to log to console if connection is successful
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
