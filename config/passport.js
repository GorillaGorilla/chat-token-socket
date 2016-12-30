/**
 * Created by frederickmacgregor on 20/09/2016.
 */
"use strict";
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt,
    socketio = require('socket.io');

// load up the user model
var Responder = require('../app/models/db_models/responder.server.model.js');
var config = require('./config'); // get db config file

module.exports = function(passport) {
    var opts = {};
    opts.secretOrKey = config.sessionSecret;
    opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
    // console.log("$$$Passport opts: ", opts);
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        Responder.findOne({id: jwt_payload.id}, function(err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        });
    }));
};