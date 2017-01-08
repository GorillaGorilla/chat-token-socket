/**
 * Created by frederickmacgregor on 03/11/2016.
 */
"use strict";

var
    UUID = require('node-uuid'),
    GameServer = require('./../app/controllers/game_server.server.js'),
    Responder = require('mongoose').model('Responder'),
    socketioJwt = require('socketio-jwt'),
    jsonWebToken = require('jsonwebtoken'),
    config = require('./config'),
    Watson = require('./../app/controllers/watsonChat'),
    Attack = require('./../app/controllers/attack.controller');

// // run the engine
// Engine.run(engine);
//
// // run the renderer
// Render.run(render);

var messages = [

];


module.exports = function(io){


    // io.use(function(socket, next) {
    //     console.log('hello socket middleware');
    //     console.log(socket.request);
    //     next();
    // });
    //
    // io.use(function(socket, next) {
    //
    //     console.log('%%%middleware 2',socket.request);
    //
    //     var userToken = req.get("Authorization");
    //     var gameToken = req.get("game_token");
    //     Responder.findOne({name: req.body.name}, function(err, user) {
    //         if (err)
    //         {console.log("mongodb query err", err);
    //             return res.send(err);}
    //         if (!user) {
    //             console.log("no user");
    //             next(new Error('User is not authenticated'), false);
    //         } else {
    //             next(null,true)
    //         }
    //     });
    //     next(new Error('User is not authenticated'), false);
    //     next();
    // });

    // io.on('connection', socketioJwt.authorize({
    //     secret: Buffer(config.sessionSecret, 'base64'),
    //     timeout: 15000 // 15 seconds to send the authentication message
    // }));

    io.on('connection', function(socket){
        // crazy shit to allow us to pass on the connection to io.authenticated
        var server = io.server || socket.server;
        if (!server.$emit) {
            //then is socket.io 1.0
            var Namespace = Object.getPrototypeOf(server.sockets).constructor;
            if (!~Namespace.events.indexOf('authenticated')) {
                Namespace.events.push('authenticated');
            }
        }
        socket.on('authenticate', function(data){

            if (true){
                //cant decode token for some reason
                // console.log('data.token', data.token, config.sessionSecret);
                // var user = jsonWebToken.verify(data.token, config.sessionSecret);
                // console.log('user', user.name);
                if (data.name){
                    Responder.findOne({name: data.name}, function(err, user) {
                        if (err)
                        {console.log("mongodb query err", err);
                            return socket.emit('unauthorized', err);
                        }

                        console.log('user retreived?', user);
                        if (!user) {
                            console.log("no user");
                            return socket.emit('unauthorized', "no user");
                        } else {
                            socket.emit('authenticated');

                            if (server.$emit) {
                                server.$emit('authenticated', socket);
                            } else {
                                //try getting the current namespace otherwise fallback to all sockets.
                                var namespace = (server.nsps && socket.nsp &&
                                    server.nsps[socket.nsp.name]) ||
                                    server.sockets;
                                console.log(namespace);
                                // explicit namespace
                                namespace.server.emit('authenticated', socket);
                            }
                        }
                    });
                }

            }


            // return socket.emit('unauthorized');
            // return next(new Error('User is not authenticated'), false);

        });
        //
    });

    io.on('authenticated', function (socket) {
        console.log('authenticated event arrived');
        // when the client emits 'new message', this listens and executes
        socket.emit('existing messages', {messages: messages});


        socket.on('new message', function (data) {
            console.log('new message data', data);
            // we tell the client to execute 'new message'

            if(data.message.includes('watson') || data.message.includes('Watson')){
                console.log('watson question detected');
                Watson.passToWatson({text: data.message, context: null}, function(err, result){
                    var msgs;
                    if (result.raw.intents[0].intent === 'missedevents'){
                        console.log('missed events intent');
                        var player = GameServer.getPlayerEntity(socket.username);
                        var dateFrom = new Date();
                        dateFrom.setTime(dateFrom.getTime() - 3600000*4);
                        Attack.getRecentAttacks({
                            dateFrom : dateFrom,
                            username: socket.username,
                            gameId : data.gameId
                        },function(err, result){
                            if(err){return console.log(err);}

                            msgs = Attack.formatAsMessages(result, socket.username);
                            console.log('emitting messages all messages', msgs);
                            socket.emit('all messages', {messages:msgs});
                        } );

                    }else{
                        io.emit('new message', {message: result.chatResponse, username: 'Watson', context: result.context});
                    }
                });
            }

            messages.push({username: socket.username,
                message: data.message});
            socket.broadcast.emit('new message', {
                username: socket.username,
                message: data.message
            });
        });

        // when the client emits 'add user', this listens and executes


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

        socket.on('chat opened', function(){
            console.log('chat opened');
            socket.emit('all messages', {messages: messages})
        });

        // when the user disconnects.. perform this
        socket.on('disconnect', function () {
            // if (addedUser) {
            //     --numUsers;
            //
            //     // echo globally that this client has left
            //     socket.broadcast.emit('user left', {
            //         username: socket.username,
            //         numUsers: numUsers
            //     });
            // }
        });

        require('./../app/controllers/gamelobby.server.controller.js')(io, socket);
    });

};






