/**
 * Created by GB115151 on 03/08/2016.
 */
"use strict";
var UUID = require('node-uuid');
var GameServer = require('./game_server.server.js');
var debug = require('debug'),
    UserController = require('./auth.server.controller.js'),
    AttackCtrl = require('./attack.controller'),
    proj = require('../controllers/convert_maps');

// total number of players across all games (including disconnected ones???)
var numUsers = 0;

module.exports = function(io, client) {
    console.log('game server lobby called');
    var addedUser = false;
    var clientsGame = '';
    //Generate a new UUID, looks something like
    //5b2ca132-64bd-4513-99da-90e838ca47d1
    //and store this on their client/connection
    // client.userid = UUID();
    client.on('add user', function (data) {
        //should look for games, if there's no game then create one, if there is a game then
        console.log('add user', data);
        var username = data.name,
            userToken = data.token;
        if (addedUser) {return};

        // we store the username in the socket session for this client
        client.username = username;
        client.userId = UUID();
        console.log('add user', client.username);
        addedUser = true;
        numUsers ++;
        //check each game for the player. Name should be unique. Called once when a new socket connects
        GameServer.findGame(client);


        var clientsGame = GameServer.getPlayerGame(username);
        console.log('emitting onconnected', clientsGame.gameId);
        UserController.updateGameSession(client.username, client.gameId);
        // if (clientsGame.running){
        //
        // }
        client.emit('game connected', { gameId: clientsGame.gameId , numUsers: clientsGame.playerCount, username : client.username} );
        io.emit('new message', {username: 'game', message: '' + client.username + ' joined, total players: ' + numUsers});
    });


    client.on('gameInputMessage', function(dat){
        console.log('gameInputMessage',dat);
        GameServer.queuePlayerInput(dat);

    });

    client.on('request history', function(dat){
        var player = GameServer.getPlayerEntity(client.username);
        var dateFrom = new Date();
        dateFrom.setHours(dateFrom.getTime() - 3600000*6);
        AttackCtrl.getRecentAttacks({
            dateFrom : dateFrom,
            username: client.username
        },function(err, result){
            if(err){return console.log(err);}
            AttackCtrl.formatAsMessages(result);
        })
    });

    client.on('control point state', function(listOfRelevantPoints){
        console.log('control point state');
        var points = [];
        if (listOfRelevantPoints){
        //    grab only those points

        }
        // testing performance... lol
        console.log('cp1', Date.now());
            // crashed once at char54...why??
            GameServer.getPlayerGame(client.username).controlPoints.forEach(function(cp){
                if(cp.owner){

                }
                console.log('gamelobby cp', cp.name, cp.y, cp.x);
                var clone = cp.createClone();
                proj.metresToMaps(clone);
                if(clone.owner){

                }
                console.log('gamelobby cp', clone.name, clone.y, clone.x);
                if (clone)
                points.push(clone);
            });
        console.log('cp2', Date.now());


        client.emit('control points', {points: points});
    });

    client.on('location', function(dat){
        console.log('location event',dat);
        GameServer.playerLocationUpdate(dat);
    });

    client.on('leave game',function(dat){
        console.log('---------------------------------leave game');
        console.log('-');
        console.log('-');
        console.log('-');
        console.log('-');
        for (var gameId in GameServer.games){
            console.log('gameId', gameId);
            if (GameServer.games[gameId].getPlayerEntity(client.username)){
                io.emit('new message', {username: "Game", message: client.username + " disconnected."});
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

    client.on('disconnect', function() {
        var play = GameServer.setDisconnectTime(client.username);
        // console.log('discon time',play.disconnectedAt);
        console.log('disconnect username', client.username);

    });



};




