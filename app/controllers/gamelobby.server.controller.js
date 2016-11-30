/**
 * Created by GB115151 on 03/08/2016.
 */
"use strict";
var UUID = require('node-uuid');
var GameServer = require('./game_server.server.js');
var debug = require('debug');


var numUsers = 0;

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
        numUsers ++;

        if (GameServer.game_count ===0){
            clientsGame = GameServer.createGame(client);
        }else{
            for (var gameId in GameServer.games){
                if (GameServer.games[gameId].playerCount < 6){
                    GameServer.games[gameId].addPlayer(client);
                    clientsGame = gameId;
                }
            }
            clientsGame = clientsGame || GameServer.createGame(client) ;
        };


        console.log('emitting onconnected', clientsGame);
        client.emit('onconnected', { gameId: clientsGame , numUsers: numUsers, userId : client.userId} );
        io.emit('new message', {username: 'game', message: '' + client.username + ' joined, total players: ' + numUsers});
    });


    client.on('gameInputMessage', function(dat){
        // console.log('gameInputMessage',dat);
        GameServer.queuePlayerInput(dat);

    });

    client.on('location', function(dat){
        console.log('location event',dat);
        GameServer.playerLocationUpdate(dat);
    });

    client.on('disconnect', function() {
        console.log('disconnect userID', client.userId);
        for (var gameId in GameServer.games){
            if (GameServer.games[gameId].players[client.userId]){
                io.emit('new message', {username: "Game", message: client.userId + " disconnected."});
                GameServer.games[gameId].removePlayer(client);
                if(GameServer.games[gameId].playerCount < 1){
                    GameServer.deleteGame(gameId);
                }
                debug('game found, player removed');
            }
        }
        if (addedUser) {
            --numUsers;

            // echo globally that this client has left
            client.broadcast.emit('user left', {
                username: client.username,
                numUsers: numUsers
            });
        }


    });



};




