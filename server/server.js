if (process.env.NODE_ENV != 'production') {
    require('dotenv').config(); // load environment variables in development, automatically done by the server in production
}

// bring in core modules and packages
const http = require('http');
// additional packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const socketio = require('socket.io');
const passport = require('passport');

// web application
const app = express();

// database connection
const DB_URI = process.env.MONGODB_URI;
mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

// middlewares
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// import routes
const omiRouter = require('./routes/omi');
const userRouter = require('./routes/users');
const downloadsRouter = require('./routes/downloads');

// use route handlers
app.use('/omi', omiRouter);
app.use('/users', userRouter);
app.use('/downloads', downloadsRouter);

// web server
const server = http.createServer(app);

// websecket server
const io = socketio(server, {
    cors: {
        origin: '*'
    }
});

// game servers
require('./games/omiGames')(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));