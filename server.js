/**
 * Created by frederickmacgregor on 20/09/2016.
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var db          = require('./config/mongoose.js')();
var passport	= require('passport');
var Responder        = require('./app/models/responder.server.model.js'); // get the mongoose model
var port        = process.env.PORT || 8080;
var jwt         = require('jwt-simple'),
    cfenv = require('cfenv'),
    controller = require("./app/routes/auth.server.controller.js"),
    users = require("./app/routes/users.server.controller");


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

// demo Route (GET http://localhost:8080)
app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});


// pass passport for configuration
require('./config/passport')(passport);


app.use(allowCrossDomain);


// bundle our routes
var apiRoutes = express.Router();

// create a new user account (POST http://localhost:8080/api/signup)
apiRoutes.post('/signup', controller.signup);

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', controller.authenticate);

// route to a restricted info (GET http://localhost:8080/api/memberinfo)
apiRoutes.get('/memberinfo', passport.authenticate('jwt', { session: false}), controller.memberInfo);
apiRoutes.get('/users/:recordId', passport.authenticate('jwt', { session: false}), users.read);
apiRoutes.param('recordId', users.recordByID);
//app.param('friendId', users.friendByID);


// connect the api routes under /api/*
app.use('/api', apiRoutes);

var appEnv = cfenv.getAppEnv();

app.listen(appEnv.port);
console.log('Server running at port: ' + appEnv.port);
module.exports = app;
