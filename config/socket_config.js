/**
 * Created by frederickmacgregor on 03/11/2016.
 */
"use strict";

var
    UUID = require('node-uuid'),
    GameServer = require('./../app/controllers/game_server.server.js');

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

    io.on('connection', function (socket) {



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






