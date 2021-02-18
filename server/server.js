if (process.env.NODE_ENV != 'production') {
    require('dotenv').config(); // load environment variables in development, automatically done by the server in production
}

// bring in necessary packages
const http = require('http');

const express = require('express');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const passport = require('passport');
const cors = require('cors');

// web server
const app = express();

// database connection
const DB_URI = process.env.MONGODB_URI;
mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const server = http.createServer(app);

const omiRouter = require('./routes/omi');

app.use('/omi', omiRouter);

const io = socketio(server, {
    cors: {
        origin: '*'
    }
});

require('./games')(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));