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

// apiRoutes.get('/memberinfo', passport.authenticate('jwt', { session: false}), controller.memberInfo);
apiRoutes.get('/users', passport.authenticate('jwt', { session: false}), function(req, res){
    console.log('protected route');
    res.send('protected route');
});

// connect the api routes under /api/*
app.use('/api', apiRoutes);

// demo Route (GET http://localhost:8080)

require('./config/socket_config')(io);

var appEnv = cfenv.getAppEnv();

server.listen(appEnv.port);
console.log('Server running at port: ' + appEnv.port);
module.exports = server;
