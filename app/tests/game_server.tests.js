/**
 * Created by frederickmacgregor on 21/11/2016.
 */
"use strict";
var should = require('should'),
    UUID = require('node-uuid');

// setup mock so that game server can be tested without sockets



var GameServer,
    mockSocketHandler,
    player1 = {userId: UUID(), username: 'username1'},
    player2 = {userId: UUID(), username: 'username2'},
    player3 = {userId: UUID(), username: 'username3'},
    gameId;

describe('GameServer tests', function(){
    describe('Setting up a game', function(){
        beforeEach(function(){
            GameServer = require('../controllers/game_server.server');
            mockSocketHandler = require('../../mockSocketHandler');
        });
        it('should be able to create a game', function(){
            gameId = GameServer.createGame(player1, mockSocketHandler);
            GameServer.games.should.be.an.Object;
            GameServer.games[gameId].should.be.an.Object;
            GameServer.games[gameId].should.have.property('playerEntities');
            mockSocketHandler.players[player1.userId].should.be.an.Object;
            GameServer.games[gameId].should.have.property('running',false);
        });

        it('should start a game if there are more than 2 players', function(){
            gameId = GameServer.createGame(player1, mockSocketHandler);
            GameServer.games[gameId].addPlayer(player2);
            GameServer.games.should.be.an.Object;
            GameServer.games[gameId].should.be.an.Object;
            GameServer.games[gameId].should.have.property('playerEntities');
            // console.log(GameServer.games[gameId].playerEntities);
            GameServer.games[gameId].playerEntities.should.be.an.Array;
            // res.body.should.be.an.Array.and.have.length(3);
            mockSocketHandler.players[player1.userId].should.be.an.Object;
            GameServer.games[gameId].should.have.property('running',true);
        });

        it('should be able to add more players while running', function(){
            gameId = GameServer.createGame(player1, mockSocketHandler);
            GameServer.games[gameId].addPlayer(player2);
            GameServer.games.should.be.an.Object;
            GameServer.games[gameId].should.be.an.Object;
            GameServer.games[gameId].should.have.property('playerEntities');
            // console.log(GameServer.games[gameId].playerEntities);
            GameServer.games[gameId].playerEntities.should.be.an.Array;
            // res.body.should.be.an.Array.and.have.length(3);
            mockSocketHandler.players[player1.userId].should.be.an.Object;
            GameServer.games[gameId].should.have.property('running',true);
            GameServer.games[gameId].addPlayer(player3);
            GameServer.games[gameId].should.have.property('running',true);
        });

        it('should stop the game running if players drop below 2', function(){
            gameId = GameServer.createGame(player1, mockSocketHandler);
            GameServer.games[gameId].addPlayer(player2);
            GameServer.games.should.be.an.Object;
            GameServer.games[gameId].should.be.an.Object;
            GameServer.games[gameId].should.have.property('playerEntities');
            // console.log(GameServer.games[gameId].playerEntities);
            GameServer.games[gameId].playerEntities.should.be.an.Array;
            // res.body.should.be.an.Array.and.have.length(3);
            mockSocketHandler.players[player1.userId].should.be.an.Object;
            GameServer.games[gameId].should.have.property('running',true);
            GameServer.games[gameId].removePlayer(player2);
            GameServer.games[gameId].should.have.property('running',false);
            console.log(mockSocketHandler.events);
        });

        it('should emit a new message to each player as the game starts', function(){
            gameId = GameServer.createGame(player1, mockSocketHandler);
            GameServer.games[gameId].addPlayer(player2);
            GameServer.games[gameId].should.have.property('running',true);
            // res.body.should.be.an.Array.and.have.length(3);
            mockSocketHandler.players[player1.userId].should.be.an.Object;
            mockSocketHandler.players[player2.userId].should.be.an.Object;
            mockSocketHandler.events[player1.userId].should.be.an.Array;
            mockSocketHandler.events[player2.userId].should.be.an.Array;
            mockSocketHandler.events[player1.userId][0].should.have.property('type','new message');
            mockSocketHandler.events[player2.userId][0].should.have.property('type','new message');

        });

        afterEach(function(){
            GameServer = null;
            mockSocketHandler.reset();
        });
    });

    describe('Testing game behaviour',function(){
        var play1LocationEvent = {gameId: gameId, location: {userId : player1.userId, x : -2.35, y: 46.02}};

        beforeEach(function(){
            GameServer = require('../controllers/game_server.server');
            mockSocketHandler = require('../../mockSocketHandler');
            gameId = GameServer.createGame(player1, mockSocketHandler);
            GameServer.games[gameId].addPlayer(player2);
        });
        it('should be able to queue a location change input',function(done){
            GameServer.playerLocationUpdate(play1LocationEvent);

            // mockSocketHandler.events[player1.userId].filter(function(event){
            //     return event.type === 'location';
            // }).
            // forEach(function(event){
            //     console.log('1',event);
            //
            // });
            // done();
            setTimeout(function(){
                console.log(GameServer.games[gameId].new_locations);

                // mockSocketHandler.events[player1.userId].forEach(function(event){
                //     console.log('2',event);
                //
                // });
                done();
            },0);
            // GameServer.games[gameId].getPlayerEntity(player1.userId).getX();
        });



        afterEach(function(){
            GameServer = null;
            mockSocketHandler.reset();
        });
    })





});

