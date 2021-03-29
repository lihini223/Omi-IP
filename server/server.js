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
const session = require('express-session');
const flash = require('express-flash');
const methodOverride = require('method-override');

// web application
const app = express();

// database connection
const DB_URI = process.env.MONGODB_URI;
mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

const initializePassport = require('./config/passport');
initializePassport(passport);

// middlewares
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');

// import routes
const omiRouter = require('./routes/omi');
const userRouter = require('./routes/users');
const downloadsRouter = require('./routes/downloads');
const adminRouter = require('./routes/admins');
const advertisementRouter = require('./routes/advertisements');
const scoreRouter = require('./routes/scores');

// use route handlers
app.use('/omi', omiRouter);
app.use('/users', userRouter);
app.use('/downloads', downloadsRouter);
app.use('/admins', adminRouter);
app.use('/advertisements', advertisementRouter);
app.use('/scores', scoreRouter);

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