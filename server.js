/**
 * Created by frederickmacgregor on 20/09/2016.
 */
"use strict";
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express     = require('express'),
    app         = express(),
    bodyParser  = require('body-parser'),
    morgan      = require('morgan'),
    db          = require('./config/mongoose.js')(),
    passport	= require('passport'),
    jwt         = require('jwt-simple'),
    cfenv = require('cfenv'),
    controller = require("./app/routes/auth.server.controller.js"),
    users = require("./app/routes/users.server.controller"),
    survey = require("./app/routes/survey.server.controller"),
    server = require('http').createServer(app),
    io = require('socket.io')(server);




// get our request parameters7
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// log to console
app.use(morgan('dev'));

// Use the passport package in our application
app.use(passport.initialize());


// pass passport for configuration
require('./config/passport')(passport);


// bundle our routes
var apiRoutes = express.Router();

// create a new user account (POST http://localhost:8080/api/signup)
apiRoutes.post('/signup', controller.signup);

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', controller.authenticate);
apiRoutes.post('/logsurvey', passport.authenticate('jwt', { session: false}), survey.create);
apiRoutes.get('/listsurveys', survey.list);
// apiRoutes.get('/memberinfo', passport.authenticate('jwt', { session: false}), controller.memberInfo);
apiRoutes.get('/users/:recordId', passport.authenticate('jwt', { session: false}), users.read);
apiRoutes.param('recordId', users.recordByID);

// connect the api routes under /api/*
app.use('/api', apiRoutes);

// demo Route (GET http://localhost:8080)


io.on('connection', function (socket) {
    console.log('connection');
    var addedUser = false;

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
        if (addedUser) return;

        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        if (addedUser) {
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});


var appEnv = cfenv.getAppEnv();

app.listen(appEnv.port);
console.log('Server running at port: ' + appEnv.port);
module.exports = app;
