/**
 * Created by GB115151 on 04/08/2016.
 */
"use strict;"

var game_server = module.exports = { games : {}, game_count:0 , tokens: []},
proj = require('./convert_maps'),
UUID = require('node-uuid'),
debug = require('debug')('http'),
    GameFactory = require('../models/Game');
    Matter = require('matter-js'),
    Engine = Matter.Engine,
    Bodies = Matter.Bodies,
    Vector = Matter.Vector,
    Body =  Matter.Body,
    PlayerFactory = require('../models/game_entities/PlayerEntity'),
    BomberFactory = require('../models/game_entities/Bomber'),
    BatteryFactory = require('../models/game_entities/AABattery'),
        Attack = require('../models/db_models/Attack.model.js'),
    AttackCtrl = require('./attack.controller');


game_server.findGame = function(player){
    var self = this;
    if (this.game_count === 0){
        this.createGame(player);
    }else{
        var ent = self.getPlayerEntity(player.username);
        if (ent){
        //    player is already in a game, therefore replace the old socket connection with the new one.
            var dateFrom = ent.disconnectedAt;
            // console.log('dateFrom',dateFrom);
            // console.log('now', new Date());

            Attack.find({occurred : { $gte : dateFrom} }, function(err, docs){
                if(err){console.log('err', err)}
                // console.log('attacks since disconnecting',docs); //prints empty arry []
            });

            self.games[ent.gameId].socketHandler.addPlayer(player);
        //    in this case query db for all events since ent.disconnectedAt

        }else{
            for (var gameId in self.games){
                if (this.games[gameId].playerCount < 10){
                    return this.games[gameId].addPlayer(player);
                }
            }
            // if no free spaces then create a new game
            this.createGame(player);
        }


        // this.joinGame(player);
    }
};

game_server.getPlayerGame = function(playerName){
    var self = this;
    for (gameId in self.games){
        if (self.getGame(gameId).getPlayerEntity(playerName)){
            return self.getGame(gameId);
        }
    }
};

game_server.createGame = function(player, socketHandler){
    var id = UUID();
    this.games[id] = GameFactory.create(id, socketHandler, AttackCtrl);
    this.game_count ++;
    this.games[id].addPlayer(player);
    console.log("game players: ", this.games[id].playerCount);
    return id;
};
game_server.joinGame = function(player){
    console.log("error: no games to join");
};

game_server.endGame = function(){

};

game_server.playerLocationUpdate = function(eventData){
    console.log("playerLocationUpdate", eventData);
    var self = this;
    if (self.games[eventData.gameId]){

        console.log("add location to queue");
        self.games[eventData.gameId].new_locations[eventData.location.username] = eventData.location;
    }
};

game_server.queuePlayerInput = function(eventData){
    var self = this;
    if (self.games[eventData.gameId]){
        return self.games[eventData.gameId].inputs.push(eventData.input);
    }
};

game_server.getPlayerEntity = function(username){
    //loops games looking for a player with that ID. Returns when found.
    var self = this;
    for (gameId in self.games){
        if (self.games[gameId].getPlayerEntity(username)){
            return self.games[gameId].getPlayerEntity(username);
        }
    }
};

game_server.setDisconnectTime = function(username){
    //loops games looking for a player with that ID. Returns when found.
    var self = this;
    for (gameId in self.games){
        if (self.games[gameId].getPlayerEntity(username)){
            self.games[gameId].setPlayerEntityDisconnectTime(username);
            return self.games[gameId].getPlayerEntity(username);
        }
    }
};


game_server.getGame = function(gameId){
    return this.games[gameId];
};

game_server.reset = function(){
    //note that calls to update and gwt next frame will still be sitting on the event queue, so all games should be paused before deleting.
    var self = this;
    // console.log('GameServer.reset',this.games);
    for (game in this.games){
        console.log(game);
        if (this.games[game]){
            this.games[game].pause();
            self.deleteGame(game);
        }

    }
    this.games = {};
    this.game_count = 0;
};

game_server.deleteGame = function(gameId){
    if (this.games[gameId]){
        this.games[gameId].pause();
        delete this.games[gameId];
    }
};