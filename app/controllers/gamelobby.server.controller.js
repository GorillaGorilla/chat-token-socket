/**
 * Created by GB115151 on 03/08/2016.
 */
"use strict";
var UUID = require('node-uuid');
var GameServer = require('./game_server.server.js');
var debug = require('debug');

module.exports = function(io, client) {
    console.log('game server lobby called');
    var addedUser = false;
    var clientsGame = '';
    //Generate a new UUID, looks something like
    //5b2ca132-64bd-4513-99da-90e838ca47d1
    //and store this on their client/connection
    // client.userid = UUID();
    client.on('add user', function (username) {
        console.log('add user', username);
        if (addedUser) {return};

        // we store the username in the socket session for this client
        client.username = username;
        client.userId = UUID();
        console.log('add user', client.userId);
        addedUser = true;

        if (GameServer.game_count ===0){
            clientsGame = GameServer.createGame(client);
        }else{
            for (var gameId in GameServer.games){
                if (GameServer.games[gameId].playerCount === 1){
                    GameServer.games[gameId].addPlayer(client);
                    clientsGame = gameId;
                }
            }
            clientsGame = GameServer.createGame(client)
        };

        // echo globally (all clients) that a person has connected
        client.broadcast.emit('user joined', {
            username: client.username
        });

        io.emit('onconnected', { gameId: clientsGame } );
    });


    client.on('gameInputMessage', function(dat){
        debug(dat);
        GameServer.games[dat.gameId].inputs[client.userId] = dat;
    });

    client.on('disconnect', function() {
        debug('userID', client.userId)
        for (var gameId in GameServer.games){
            if (GameServer.games[gameId].players[client.userId]){
                GameServer.games[gameId].removePlayer(client);
                debug('game found, player removed');
            }
        }
        io.emit('chatMessage', {
            type: 'status',
            text: 'disconnected',
            created: Date.now(),
            username: client.username
        });
    });



};