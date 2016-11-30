/**
 * Created by GB115151 on 04/08/2016.
 */
"use strict;"



var game_server = module.exports = { games : {}, game_count:0 },
proj = require('./convert_maps'),
UUID = require('node-uuid'),
debug = require('debug')('http'),
    Matter = require('matter-js'),
    Engine = Matter.Engine,
    Bodies = Matter.Bodies,
    Vector = Matter.Vector,
    Body =  Matter.Body,
    PlayerFactory = require('../models/PlayerEntity'),
    BomberFactory = require('../models/Bomber');






var requestUpdateFrame;
var RENDER_TIME = 200000;

    var lastTime = 0;
    var frame_time = 45000;
        requestUpdateFrame = function (game,  callback) {
            // debug('RequestUpdateFrame called');
            debug('lastTime', lastTime);
            var currTime = getNanoTime(),
                timeToCall = Math.max( 0, frame_time - ( currTime - lastTime ) );
            game.runningTime += timeToCall;
            game.renderTime += timeToCall;
            debug("curr time", currTime);
            debug("time to call", timeToCall);
            debug("currtime + timetocall", currTime + timeToCall)
            var id = setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall/1000 );
            lastTime = currTime + timeToCall;
            return id;
        };


game_server.findGame = function(player){
    if (this.game_count === 0){
        this.createGame(player);
    }else{
        this.joinGame(player);
    }
};
game_server.createGame = function(player, socketHandler){
    var id = UUID();
    this.games[id] = gameFactory(id, socketHandler);
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
        self.games[eventData.gameId].new_locations[eventData.location.userId] = eventData.location;
    }
};

game_server.queuePlayerInput = function(eventData){
    var self = this;
    if (self.games[eventData.gameId]){
        return self.games[eventData.gameId].inputs.push(eventData.input);
    }
};

game_server.getPlayerEntity = function(userId){
    //loops games looking for a player with that ID. Returns when found.
    var self = this;
    for (gameId in self.games){
        if (self.games[gameId].getPlayerEntity(userId)){
            return self.games[gameId].getPlayerEntity(userId);
        }
    }
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

var gameFactory = function(id, socketHandler){
    var socketHandler = socketHandler || {
        players: {},
        addPlayer : function(player){
            this.players[player.userId] = player;
        },
        sendMessages: function(msg){
            var self = this;
            for (var playerId in self.players){
                debug('player', playerId);
                self.emit(playerId, 'new message', msg);  //^^1
            }
        },
        sendGameState: function(msg){
            var self = this;
            for (var playerId in self.players){
                debug('player', playerId);
                self.emit(playerId, 'gameState', msg);  //^^1
            }
        },
        emit :function(id, event, msg){
            this.players[id].emit(event, msg);
        },
        removePlayer : function(player){
            delete this.players[player.userId];
        }


    };

    // if (process.env.NODE_ENV === 'test'){
    //     socketHandler.emit = function(id, event, msg){
    //         console.log(Date.now());
    //         console.log(id + " "+ event +" that would be emitted: ", msg);  //^^1
    //     };
    // }

    var World = Matter.World;

// create an engine
    var engine = Engine.create();

    engine.world.gravity.y = 0;


    return {
        gameId: id,
        socketHandler: socketHandler,
        running : false,
        playerCount : 0,
        players : {},
        World: World,
        Bodies: Bodies,
        engine: engine,
        // arena : arenaFactory(),
        inputs : [],
        new_locations : {},
        startTime : 0,
        runningTime : 0,
        renderTime : 0,
        lastUpdateTime : 0,
        bombers: [],
        playerEntities: [],
        bombs : [],
        getPlayerEntity: function(id){
            var playerEntity = null;
            this.playerEntities.forEach(function(ent){
                if(ent.userId === id){
                    playerEntity = ent;
                    return;
                }
            });
            return playerEntity;
        },
        updateBombs : function(dt){
            var self = this;
            self.bombs.forEach(function(bomb, i){
                bomb.update(dt);
                if (bomb.state === 'detonate'){
                    console.log('fire in the hole!');
                    console.log('x', bomb.getX());
                    console.log('y', bomb.getY());
                    self.playerEntities.forEach(function(playEnt){
                        var distanceVector = Vector.sub(bomb.getPosition(), playEnt.physical.position);
                        console.log('distanceVector bomb, playEnt', distanceVector);
                        var distanceSq = Vector.magnitudeSquared(distanceVector) || 0.0001;
                        console.log('distanceVector bomb, playEnt', distanceSq);
                        if (distanceSq < bomb.blast_radius){
                            console.log('hit');
                            playEnt.health -= bomb.damage;
                        }
                    });
                //    remove bomb
                    self.bombs.splice(i, 1);

                }
            });
        },
        addBomb : function(bomb){
            this.bombs.push(bomb);
        },
        run : function() {
            var self = this;
            self.running = true;
            console.log("running");
            // for (var playerId in self.players){
            //     debug('player', playerId);
            //     self.players[playerId].emit('new message', writeMessage());  //^^1
            // }
            this.socketHandler.sendMessages(writeMessage());
            this.startTime = getNanoTime();
            var t0 = getNanoTime();
            var deltaTime = (1000000);
            this.lastUpdateTime = getNanoTime();
            if (deltaTime > 0.1){
                deltaTime = 0.1;
            }
            debug('deltaTime', deltaTime);
            debug('this.lastUpdateTime',this.lastUpdateTime);
            this.update(deltaTime + this.lastUpdateTime, this.inputs);
            if (this.renderTime>0.001){
                // this.arena.render();
                this.renderTime = 0;
            }

            function writeMessage(){
                return {username: 'game', message : 'game starting, ' + self.playerCount + ' players.'};
            };

        },
        writeState : function(){
            var str = '';
            this.playerEntities.forEach(function(playEnt){
                var map_location = {x: playEnt.physical.position.x, y: playEnt.physical.position.y};
                // console.log('map_location', playEnt.username, 'pos', map_location);
                proj.metresToMaps(map_location);
                // console.log('map_location', playEnt.username, 'pos after', map_location);
                str = str + "## playEnt position " + playEnt.username + ' '+ map_location.x +' '+ map_location.y + '\n';
                if (playEnt.bombers.length > 0){
                    playEnt.bombers.forEach(function(bomber){
                        var bomber_location = {x: bomber.getX(), y: bomber.getY()};
                        proj.metresToMaps(bomber_location);
                        str = str + '--bomber x: ' + bomber_location.x + ' y: ' + bomber_location.y + '\n';
                    })

                }
            });
            return str;
            },

        update : function (t){
            var self = this;
            debug("update called", t);
            var dt = (t - this.lastUpdateTime)/1000000000; // used to be 1000000000
            debug("dt", dt);
            debug ("this.running", this.running);
            this.lastUpdateTime = getNanoTime();
            this.runningTime += dt;
            self.handleInputs();
            // scale dt to slow down game. Remember to put it back for rendering
            dt = dt *100;
            // this.arena.update(dt, this.inputs);
            self.handleLocations();
            self.updateBombs(dt);
            self.playerEntities.forEach(function(ent){
                ent.update(dt);
            });
            self.bombers.forEach(function(bomber, index){
                if (bomber.running){
                    bomber.update(dt);
                }else{
                    // probably a bug here to do with bomber array in the playerEntity... should be a delete method.
                    self.bombers.splice(index,1);
                }

            });
            // console.log('handle locations over');
            Engine.update(engine, dt);
            // console.log('engine update over', dt);
            dt = dt/100;
            this.renderTime += dt;
            // console.log('update: this.renderTime', this.renderTime);
            // console.log('engine update over', this.renderTime);

            if (this.renderTime>RENDER_TIME){
                // this.arena.render();
                // console.log('rendering');
                var assets = [];
                this.bombers.forEach(function(bomber){
                    var bomberState = bomber.getState();
                    proj.metresToMaps(bomberState);
                    assets.push(bomberState);
                });
                var playerStates = [];
                this.playerEntities.forEach(function(entity){
                    var entityState = entity.getState();
                    proj.metresToMaps(entityState);
                    playerStates.push(entityState);
                    
                });
                // console.log('assets created');
                this.renderTime = 0;
                // for (playerId in this.players){ // ^^2
                //     debug('player', playerId);
                //     // console.log('assets', assets);
                //     // console.log('playerStates', playerStates);
                //     console.log('emitting to: ', this.players[playerId].username);
                //     self.players[playerId].emit('gameState', {players: playerStates, assets: assets});//^^3
                //
                //
                // }
                self.socketHandler.sendGameState({players: playerStates, assets: assets});
            }
            if (this.running){
                debug("running is true");
                requestUpdateFrame(self, self.update.bind(self));
            }
        },
        handleInputs: function(){
            var self = this;
            this.playerEntities.forEach(function(playEnt){
                self.inputs.filter(function(input){
                    return (input.userId === playEnt.userId);
                })
                    .forEach(function(input, index, obj){

                        if (input.action === 'SEND_BOMBER') {
                            if (playEnt.bomber_ready > 0 && playEnt.state === 'living') {
                                console.log('playEnt has bomber_ready > 0', input.target);
                                proj.mapsToMetres(input.target);
                                console.log('target after conversion: ', input.target);
                                BomberFactory.newBomber(playEnt, self).addTarget(input.target.x, input.target.y);
                            }
                        }
                        self.inputs.splice(index, 1); //remove input after its taken care of

                    });
            });

        },
        handleLocations: function(){
            var self = this;
            // console.log('handleLocations called',self.gameId, self.new_locations);
            self.playerEntities.forEach(function(playEnt){
                if (self.new_locations[playEnt.userId]){
                    console.log('playEnt has location');
                    proj.mapsToMetres(self.new_locations[playEnt.userId]);
                    // console.log('proj.x', self.new_locations[playEnt.userId].x);
                    playEnt.setPosition(self.new_locations[playEnt.userId].x, self.new_locations[playEnt.userId].y);
                    self.new_locations[playEnt.userId] = null;
                }
            })
            
        },
        pause : function(){this.running =false;},

        addPlayer : function(player){
            debug('adding player', player.userId);
            console.log("player pushed");
            // this.players[player.userId] = player;  //^^2
            this.socketHandler.addPlayer(player);
            // this.arena.addPlayer(player);
            var newPlayerEntity = PlayerFactory.newPlayer(this.playerEntities.length +1, this.playerEntities.length +1, player, this);

            this.playerEntities.push(newPlayerEntity);
            player.game = this;
            this.playerCount ++;
            // console.log(this);
            if (this.playerCount >1){
                this.running = true;
                this.run();
            }
            // debug('all bodies', this.World.bodies);
        },
        removePlayer : function(player){
            var self = this;
            debug('game.removePlayer called');
            // this.arena.removePlayer(player);
            var index = null;
            this.playerEntities.forEach(function(ent, i){
                if (ent.userId === player.userId){
                    //remove from world/physics list
                    index = i;
                    self.World.remove(engine.world, ent.physical);
                }
            });
            // remove from player entities list
            if (index){
                self.playerEntities.slice(index, 1);
            }
            // delete self.players[player.userId]; //^^4
            delete self.socketHandler.players[player.userId];

            this.playerCount --;
            if (this.playerCount < 2){
                this.pause();
            }
            // debug('all bodies', this.World.bodies);
        },

        stop : function () {
            
        }
    }
};


var getNanoTime = function() {
    var hrTime = process.hrtime();
    return (hrTime[0] * 1000000 + hrTime[1] / 1000);
};

