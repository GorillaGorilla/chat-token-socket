/**
 * Created by frederickmacgregor on 03/11/2016.
 */
"use strict";

var
    UUID = require('node-uuid'),
    GameServer = require('./../app/controllers/game_server.server.js'),
    Responder = require('mongoose').model('Responder'),
    socketioJwt = require('socketio-jwt'),
    config = require('./config');

// // run the engine
// Engine.run(engine);
//
// // run the renderer
// Render.run(render);





module.exports = function(io){


    io.use(function(socket, next) {
        console.log('hello socket middleware');
        next();
    });

    // io.use(function(socket, next) {
    //
    //     var userToken = req.get("Authorization");
    //     var gameToken = req.get("game_token");
    //     esponder.findOne({name: req.body.name}, function(err, user) {
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
    // });

    io.on('connection', socketioJwt.authorize({
        secret: Buffer("MegaSecret", 'base64'),
        timeout: 15000 // 15 seconds to send the authentication message
    }));

    io.on('authenticated', function (socket) {



        // function run(){
        //     setInterval(function() {
        //         Engine.update(engine, 1000 / 30);
        //         var state = JSON.stringify({boxA: boxA.position, boxB: boxB.position});
        //         socket.broadcast.emit('new message',{username: 'game', message: state});
        //         console.log({username: 'game', message: state});
        //     }, 1000 / 2);
        // }

        // when the client emits 'new message', this listens and executes
        socket.on('new message', function (data) {
            // we tell the client to execute 'new message'
            socket.broadcast.emit('new message', {
                username: socket.username,
                message: data
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






