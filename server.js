/**
 * Created by frederickmacgregor on 20/09/2016.
 */
"use strict";
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

try {
    // throw new Error("Some error..."); // remove this once you're happy with it..
    var express     = require('express'),
        app         = express(),
        bodyParser  = require('body-parser'),
        morgan      = require('morgan'),
        db          = require('./config/mongoose.js')(),
        passport	= require('passport'),
        jwt         = require('jwt-simple'),
        cors = require('cors'),
        cfenv = require('cfenv'),
        controller = require("./app/controllers/auth.server.controller.js"),
        server = require('http').createServer(app),
        io = require('socket.io')(server),
        transport = require('./config/transportsecurity'),
        Attack = require('./app/controllers/survey.server.controller'),
        LocationUpdater = require('./app/controllers/locationUpdates');


    var allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    };

    if (process.env.NODE_ENV === 'development'){
        app.use(morgan('dev'));
    }else if (process.env.NODE_ENV === 'production') {
        // app.use(compress());
        app.use(transport.httpsEnforce);
    }

    app.use(cors());

// get our request parameters7
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

// log to console
    app.use(morgan('dev'));

// Use the passport package in our application
    app.use(passport.initialize());

    app.use(allowCrossDomain);

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

    apiRoutes.post('/locationupdate', LocationUpdater.updatePlayerLocation);

    apiRoutes.get('/progress', Attack.list, Attack.returnList);

    apiRoutes.get('/progress/:gameId', Attack.list, Attack.filterByGame, Attack.returnList);

    apiRoutes.param('gameId', Attack.gameId);

// connect the api routes under /api/*
    app.use('/api', apiRoutes);

    app.use(express.static('./www'));

// demo Route (GET http://localhost:8080)

    require('./config/socket_config')(io);

    var appEnv = cfenv.getAppEnv();

    server.listen(appEnv.port);
    console.log('Server running at port: ' + appEnv.port);
    module.exports = server;
} catch (e) {
    //this should catch all uncaught exceptions
    var time = Date.now();
    var error_report = "Server Crash @ " + time + "\n\n";
    error_report += e.stack;
    var file = __dirname + "/" + time + ".txt";
    require('fs').writeFile(file, error_report, function(err) {
        if(err) return console.log("Pretty fucked now, nothing to catch this.. \n", err);
        console.log(error_report);
    });
}

