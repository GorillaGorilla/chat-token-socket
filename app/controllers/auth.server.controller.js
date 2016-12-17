/**
 * Created by frederickmacgregor on 21/09/2016.
 */
"use strict";
var Responder = require('mongoose').model('Responder'),
    passport = require('passport'),
    jwt         = require('jwt-simple'),
    jsonWebToken = require('jsonwebtoken'),
    config = require("../../config/config.js"),
    UUID = require('node-uuid'),
    GameServer = require('./game_server.server.js');



exports.signup = function(req, res, next){
    console.log("signup called");
    if (!req.body.name || !req.body.password) {
        res.json({success: false, msg: 'Please pass name and password.'});
    } else {
        var newUser = new Responder({
            name: req.body.name,
            password: req.body.password
        });
        // save the user
        newUser.save(function(err) {
            if (err) {
                console.log("mongo save err", err);
                return res.json({success: false, msg: 'Username already exists.'});
            }
            res.json({success: true, msg: 'Successful created new user.'});
        });
    }
};


exports.authenticate = function(req, res) {
    console.log("authenticate called");
    console.log(req.body);
    Responder.findOne({
        name: req.body.name
    }, function(err, user) {
        if (err)
        {
            console.log("mongodb query err", err);
            return res.send(err);
        }


        if (!user) {
            console.log("no user");
            res.send({success: false, msg: 'Authentication failed. Responder not found.'});
        } else {
            console.log("user found checking password");
            // check if password matches
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {


                    // if user is found and password is right create a token
                    // var token = jwt.encode(user, config.sessionSecret); //old method creating token from secret
                    var token = jsonWebToken.sign(user, config.sessionSecret);
                    // console.log("token created", token);
                    // console.log(jsonWebToken.verify(token, config.sessionSecret));
                    // console.log('again ',jsonWebToken.verify(token, config.sessionSecret));
                    var game_token = UUID();
                    // GameServer.tokens[req.body.name]={token: token, expires: Date.now() + 360000, name: user.name};
                    // return the information including token as JSON
                    res.json({success: true, token: token, game_token: game_token, name: user.name});
                } else {

                    console.log("compare password err: ", err);
                    res.send({success: false, msg: 'Authentication failed. Wrong password.'});
                }
            });
        }
    });
};

exports.updateGameSession = function(name,newUserSessionId){
    Responder.findOne({
        name: name
    }, function(err, user) {
        user.last_game_session = newUserSessionId;
        user.save(function(err) {
            if (err) {
                console.log("mongo save err", err);
            }
            console.log('Successful updated user.');
        });
    })
};


// Demo route, unused.
// exports.memberInfo = function(req, res) {
//     console.log("members info called", req.headers);
//     var token = getToken(req.headers);
//     token = new Buffer(token, "utf-8");
//     console.log("memberInfo token: ", token);
//     if (token) {
//         var decoded = jwt.decode(token, config.sessionSecret);
//         Responder.findOne({
//             name: decoded.name
//         }, function(err, user) {
//             if (err) {
//                 console.log("Responder.findone error", err);
//                 throw err;
//             }
//             if (!user) {
//                 return res.status(403).send({success: false, msg: 'Authentication failed. Responder not found.'});
//             } else {
//                 res.json({success: true, msg: 'Welcome in the member area ' + user.name + '!'});
//             }
//         });
//     } else {
//         return res.status(403).send({success: false, msg: 'No token provided.'});
//     }
// };

// function getToken (headers) {
//     if (headers && headers.authorization) {
//         var parted = headers.authorization.split(' ');
//         if (parted.length === 2) {
//             return parted[1];
//         } else {
//             return null;
//         }
//     } else {
//         return null;
//     }
// };
