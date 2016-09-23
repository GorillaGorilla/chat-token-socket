/**
 * Created by frederickmacgregor on 20/09/2016.
 */
var JwtStrategy = require('passport-jwt').Strategy;

// load up the user model
var User = require('../app/models/user.server.model');
var config = require('./config'); // get db config file

module.exports = function(passport) {
    var opts = {};
    opts.secretOrKey = config.sessionSecret;
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        User.findOne({id: jwt_payload.id}, function(err, user) {
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