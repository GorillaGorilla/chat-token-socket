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
    survey = require("./app/routes/survey.server.controller");


var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'example.com');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
};


// get our request parameters7
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// log to console
app.use(morgan('dev'));

// Use the passport package in our application
app.use(passport.initialize());


// pass passport for configuration
require('./config/passport')(passport);


app.use(allowCrossDomain);


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
app.get('/', function(req, res) {
    res.send('Hello! This a is a server with token authentication');
});


var appEnv = cfenv.getAppEnv();

app.listen(appEnv.port);
console.log('Server running at port: ' + appEnv.port);
module.exports = app;
