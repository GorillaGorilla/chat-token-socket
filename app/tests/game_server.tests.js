/**
 * Created by frederickmacgregor on 21/11/2016.
 */
"use strict";
var UUID = require('node-uuid'),
    proj = require('./../controllers/convert_maps'),
    chai = require('chai'),
    expect = chai.should();
    chai.use(require('chai-roughly'));

// setup mock so that game server can be tested without sockets

var GameServer,
    mockSocketHandler,
    player1 = {userId: UUID(), username: 'username1'},
    player2 = {userId: UUID(), username: 'username2'},
    player3 = {userId: UUID(), username: 'username3'},
    gameId,
    play1LocationEvent,
    play2LocationEvent,
    play1BomberEvent,
    play2BomberEvent,
    x,
    y;

describe('GameServer tests', function(){
    describe('Setting up a game', function(){
        beforeEach(function(){
            console.log('beforeEach1');
            GameServer = require('../controllers/game_server.server');
            mockSocketHandler = require('../../mockSocketHandler');
        });
        it('should be able to create a game', function(){
            gameId = GameServer.createGame(player1, mockSocketHandler);
            GameServer.games.should.be.a('object');
            GameServer.games[gameId].should.be.an.Object;
            GameServer.games[gameId].should.have.property('playerEntities');
            mockSocketHandler.players[player1.username].should.be.an.Object;
            GameServer.games[gameId].should.have.property('running',false);
        });
        it('getPlayerEntity function should return a player entity by username if it exists', function(){
            gameId = GameServer.createGame(player1, mockSocketHandler);
            GameServer.games.should.be.a('object');
            GameServer.games[gameId].should.be.an.Object;
            GameServer.games[gameId].should.have.property('playerEntities');
            mockSocketHandler.players[player1.username].should.be.an.Object;
            GameServer.games[gameId].should.have.property('running',false);
            GameServer.games[gameId].getPlayerEntity(player1.username).should.be.an.Object;
            GameServer.games[gameId].getPlayerEntity(player1.username).should.have.property('username');
            GameServer.games[gameId].getPlayerEntity(player1.username).username.should.equal(player1.username);
            GameServer.games[gameId].getPlayerEntity('wrongUsername').should.equal(false);
        });
        it('getGame function should return a game entity by ID if it exists', function(){
            gameId = GameServer.createGame(player1, mockSocketHandler);
            var game = GameServer.getGame(gameId);
            game.should.be.a.Object;
            game.should.have.property.gameId;
            game.gameId.should.equal(gameId);
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
            mockSocketHandler.players[player1.username].should.be.an.Object;
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
            mockSocketHandler.players[player1.username].should.be.an.Object;
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
            mockSocketHandler.players[player1.username].should.be.an.Object;
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
            mockSocketHandler.players[player1.username].should.be.an.Object;
            mockSocketHandler.players[player2.username].should.be.an.Object;
            mockSocketHandler.events[player1.username].should.be.an.Array;
            mockSocketHandler.events[player2.username].should.be.an.Array;
            // console.log('mockSocketHandler.events',mockSocketHandler.events);
            mockSocketHandler.events[player1.username][1].should.have.property('type','new message');
            mockSocketHandler.events[player2.username][1].should.have.property('type','new message');
        });



        afterEach(function(done){
            // GameServer.deleteGame(gameId);
            mockSocketHandler.reset();
            GameServer.reset();
            //set timeout to try and get rid of updates for other games on the events queue
            setTimeout(function(){
                done();
            },0);
        });
    });

    describe('Testing game behaviour',function(){
        beforeEach(function(){
            GameServer = require('../controllers/game_server.server');
            mockSocketHandler = require('../../mockSocketHandler');
            gameId = GameServer.createGame(player1, mockSocketHandler);
            GameServer.games[gameId].addPlayer(player2);
            x = 51.53195;
            y = 0.0037233710;
            play1LocationEvent = {gameId: gameId, location: {username : player1.username, x: 51.53195, y: 0.00372337109}};
            play2LocationEvent = {gameId: gameId, location: {username : player2.username, x : 10.35, y: 30.02}};
            console.log('end beforeEach', gameId);
        });

        it('should queue a location change input',function(done){
            GameServer.playerLocationUpdate(play1LocationEvent);
            // console.log('GameServer.getGame(gameId).new_locations',GameServer.getGame(gameId).new_locations);
            GameServer.getGame(gameId).new_locations[player1.username].should.be.a.Object;
            GameServer.getGame(gameId).new_locations[player1.username].should.have.property('x');
            GameServer.getGame(gameId).new_locations[player1.username].x.should.equal(x);
            done();
        });

        it('should apply a location change input from the queue',function(done){
            GameServer.playerLocationUpdate(play1LocationEvent);
            console.log('location event Sent', gameId);
            // GameServer.getGame(gameId).update(1);
            GameServer.games[gameId].new_locations.should.be.an.Array;
            GameServer.getGame(gameId).new_locations[player1.username].should.be.a.Object;
            //timeout waits for the update to call and execute the player input
            this.timeout(500);
            catching(done, function(){
                console.log('setTimeout', gameId);
                var playerEnt = GameServer.games[gameId].getPlayerEntity(player1.username);
                var position = {x: playerEnt.getX(), y: playerEnt.getY()};
                // because in the tests the object is passed by reference, rather than by the event,
                // so the transformation that server does from latlng to metres is reflected in the original object.
                // to test therefore it must be converted back - must be careful because this may be interfering
                // with the state as stored on the server as well!
                console.log('playerEnt', playerEnt);
                console.log('position', position);
                proj.metresToMaps(position);
                console.log('after',position, play1LocationEvent.location.x);
                position.x.should.roughly.equal(x);
                position.y.should.roughly.equal(y);

                // equalsTest(position.x, -2.35, 0.01).should.equal(true);
                // equalsTest(position.y, 46.02, 0.01).should.equal(true);
                var count = 0;
                for (var gId in GameServer.games){
                    if (GameServer.games.hasOwnProperty(gId)){
                        count ++;
                    }

                }
                count.should.equal(1);
                done();

            });
            // setTimeout(),1000, done);
        });

        it('should be able to queue 2 location change inputs and execute them on the correct entities',function(done){
            GameServer.playerLocationUpdate(play1LocationEvent);
            GameServer.playerLocationUpdate(play2LocationEvent);
            GameServer.games[gameId].new_locations.should.be.a('object');
            GameServer.games[gameId].new_locations.should.have.property(player2.username);

            // short pause to wait for the loop to finish updating positions - this could cause bugs due to race.
            setTimeout(function(){
                console.log('setTimeout');
                var playerEnt1 = GameServer.games[gameId].getPlayerEntity(player1.username),
                    playerEnt2 = GameServer.games[gameId].getPlayerEntity(player2.username),
                    position1 = {x: playerEnt1.getX(), y: playerEnt1.getY()},
                    position2 = {x: playerEnt2.getX(), y: playerEnt2.getY()};
                // because in the tests the object is passed by reference, rather than by the event,
                // so the transformation that server does from latlng to metres is reflected in the orriginal object.
                // to test therefore it must be converted back - must be careful because this may be interefering
                // with the state as stored on the server as well!

                proj.metresToMaps(position1);
                proj.metresToMaps(position2);
                // console.log('after',position, play1LocationEvent.location.x);
                // equalsTest(position1.x, 0.0037233710).should.equal(true);
                equalsTest(position1.y, 46.02, 0.01).should.equal(true);
                equalsTest(position2.x, 10.35, 0.01).should.equal(true);
                equalsTest(position2.y, 30.02, 0.01).should.equal(true);
                var count = 0;
                for (var gId in GameServer.games){
                    if (GameServer.games.hasOwnProperty(gId)){
                        count ++;
                    }

                }
                count.should.equal(1);
                done();
            },0);
        });



        it('should be able to queue a gameInput event and apply it to the correct playerEntity',function(done){
            play1BomberEvent = { gameId: gameId,
                input:{userId: player1.userId,
                    action: 'SEND_BOMBER',
                    target: {x: 40, y: 10}}};
            GameServer.getPlayerEntity(player1.userId).bomber_in_action.should.equal(0);
            GameServer.getPlayerEntity(player1.userId).bomber_ready.should.equal(1);
            GameServer.queuePlayerInput(play1BomberEvent);
            //timeout waits for the update to call and execute the player input
            setTimeout(function(){
                GameServer.getPlayerEntity(player1.userId).bomber_in_action.should.equal(1);
                GameServer.getPlayerEntity(player1.userId).bomber_ready.should.equal(0);
                GameServer.getPlayerEntity(player1.userId).bombers.should.have.length(1);
                done();
            },200);
        });

        it('should be able to queue 2 gameInput events and apply them to the correct playerEntity',function(done){
            play1BomberEvent = { gameId: gameId,
                input:{userId: player1.userId,
                    action: 'SEND_BOMBER',
                    target: {x: 40, y: 10}}};
            play2BomberEvent = { gameId: gameId,
                input:{userId: player2.userId,
                    action: 'SEND_BOMBER',
                    target: {x: 50, y: -5}}};
            GameServer.getPlayerEntity(player1.userId).bomber_in_action.should.equal(0);
            GameServer.getPlayerEntity(player1.userId).bomber_ready.should.equal(1);
            GameServer.getPlayerEntity(player2.userId).bomber_in_action.should.equal(0);
            GameServer.getPlayerEntity(player2.userId).bomber_ready.should.equal(1);
            GameServer.queuePlayerInput(play1BomberEvent);
            GameServer.queuePlayerInput(play2BomberEvent);
            //timeout waits for the update to call and execute the player input
            setTimeout(catchint(done, function(){
                GameServer.getPlayerEntity(player1.userId).bomber_in_action.should.equal(1);
                GameServer.getPlayerEntity(player1.userId).bomber_ready.should.equal(0);
                GameServer.getPlayerEntity(player1.userId).bombers.should.have.length(1);
                GameServer.getPlayerEntity(player2.userId).bomber_in_action.should.equal(1);
                GameServer.getPlayerEntity(player2.userId).bomber_ready.should.equal(0);
                GameServer.getPlayerEntity(player2.userId).bombers.should.have.length(1);
                done();
            }),0);
        });

        afterEach(function(){
            //there is a bug that there seems to be no way of stopping or deleting games... they just continue updating after being created
            // console.log('events in eventHandler', mockSocketHandler.events);
            // console.log('afterEach');
            GameServer.reset();
            mockSocketHandler.reset();
        });
    });

});

function equalsTest(num1, num2, threshold){
    var n1 = num1, n2 = num2;
    if (num1 === num2){return true;}
    if (num1 < num2){
        n1 = num2; n2 = num1;
    }
    return ((n1 - n2) < threshold);
}


function catching(done, fn) {
    try {
        fn();
        done();
    } catch(err) {
        done(err);
    }
}
