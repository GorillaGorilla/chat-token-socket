/**
 * Created by frederickmacgregor on 26/12/2016.
 */
"use strict";

var proj = require('../controllers/convert_maps'),
    UUID = require('node-uuid'),
    debug = require('debug')('http'),
    Matter = require('matter-js'),
    Engine = Matter.Engine,
    Bodies = Matter.Bodies,
    Vector = Matter.Vector,
    Body =  Matter.Body,
    PlayerFactory = require('./game_entities/PlayerEntity'),
    BomberFactory = require('./game_entities/Bomber'),
    BatteryFactory = require('./game_entities/AABattery');
    // Attack = require('mongoose').model('Attack');

var ControlPoint = require('./game_entities/controlpoint.class.js');

var requestUpdateFrame;
var RENDER_TIME = 200,
    game;

var lastTime = 0;
var frame_time = 45000000;
requestUpdateFrame = function (game,  callback, AttackCtrl) {
    // debug('RequestUpdateFrame called');
    // debug('lastTime', lastTime);
    var currTime = getNanoTime(),
        timeToCall = Math.max( 0, (frame_time - ( currTime - lastTime ))/1000000 );
    // debug('curtime-lastime', ( currTime - lastTime ));
    game.runningTime += timeToCall;
    game.renderTime += timeToCall;
    // debug("curr time", currTime);
    // debug("time to call", timeToCall);
    // debug("time to call", timeToCall/1000000);
    // debug("currtime + timetocall", currTime + timeToCall);
    var id = setTimeout( function() { callback( currTime + timeToCall*1000000 ); }, timeToCall );
    lastTime = currTime + timeToCall;
    // debug('lastTime waiting', lastTime);
    return id;
};

var pointsOfInterest = require('./controlpoints'),
hospitals = [
    {x: 50.796647, y: -2.065390,type: "HOSPITAL", owner : null}
];

var controlPoints =  [];

pointsOfInterest.forEach(function(poi){
    proj.mapsToMetres(poi);
   controlPoints.push(new ControlPoint(poi.x, poi.y, poi.name));
});

hospitals.forEach(function(poi){
    proj.mapsToMetres(poi);
    poi.position = Vector.create(poi.x, poi.y);
    poi.getPosition = function(){
        return poi.position;
    }
});

exports.create = function(id, socketHandler, dbHandler){
    var socketHandler = socketHandler || {
            players: {},
            addPlayer : function(player){
                this.players[player.username] = player;
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
                for (var playername in self.players){
                    debug('player', playername);
                    self.emit(playername, 'gameState', msg);  //^^1
                }
            },
            emit :function(name, event, msg){
                this.players[name].emit(event, msg);
            },
            removePlayer : function(player){
                delete this.players[player.username];
            }


        };
    var setPlayerEntityDisconnectTime = function(username){
        var playerEntity = null;
        this.playerEntities.forEach(function(ent){
            if(ent.username === username){
                ent.disconnectedAt = new Date();
                playerEntity = ent;
                return;
            }
        });
        return playerEntity;
    };

    var checkCollisions = function(point1, point2, distance){
    //    return true or false
        var distanceVector = Vector.sub(point1, point2);
        // console.log('distanceVector checkCOllision method', distanceVector);
        var distanceSq = Vector.magnitudeSquared(distanceVector) || 0.0001;
        // console.log('distanceVector distanceSq checkCollision method', distanceSq);
        return distanceSq < (distance*distance)

    };

    var checkVicinityInterestPoint = function(playEnt){
        var point;
        pointsOfInterest.forEach(function(poi){
            if (checkCollisions(playEnt.getPosition(), poi.getPosition(), 30)){
                poi.owner = playEnt;
                point = poi;
            };
        });
        return point;
    };

    var checkVicinityHospital = function(playEnt){
        var point;
        pointsOfInterest.forEach(function(hosp){
            if (checkCollisions(playEnt.getPosition(), hosp.getPosition(), 30)){
                playEnt.state = 'healing';
            };
        });
        return true;
    };

    var render = require('../controllers/renderer');
    // if (process.env.NODE_ENV === 'test'){
    //     socketHandler.emit = function(id, event, msg){
    //         console.log(Date.now());
    //         console.log(id + " "+ event +" that would be emitted: ", msg);  //^^1
    //     };
    // }

    var World = Matter.World;

// create an engine
    var engine = Engine.create();
    engine.timing.timeScale = 0.1;
    engine.world.gravity.y = 0;

    var nextState = {};  //variable to queue up things that need to be sent in the next rendering/synch event

    var moneyUpdate = 100000;
    var moneyUpdateTime = 100000;

    game =  {
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
        AAbatterys: [],
        playerEntities: [],
        controlPoints: controlPoints,
        bombs : [],
        flaks : [],
        getPlayerEntity: function(username){
            var playerEntity = null;
            this.playerEntities.forEach(function(ent){
                if(ent.username === username){
                    playerEntity = ent;
                    return;
                }
            });
            return playerEntity;
        },
        setPlayerEntityDisconnectTime : setPlayerEntityDisconnectTime,
        updateBombs : function(dt){
            var self = this;
            self.bombs.forEach(function(bomb, i){
                bomb.update(dt);
                if (bomb.state === 'detonate'){
                    console.log('fire in the hole!');
                    console.log('x', bomb.getX());
                    console.log('y', bomb.getY());
                    self.playerEntities.forEach(function(playEnt){
                        if (checkCollisions(bomb.getPosition(), playEnt.physical.position, bomb.blast_radius)){
                            console.log('hit');
                            playEnt.health -= bomb.damage;
                            AttackCtrl.saveAttack({
                                game: self.gameId,
                                type: "BOMB HIT PLAYER",
                                owner: bomb.owner.username,
                                target: playEnt.username,
                                x: bomb.getX(),
                                y: bomb.getY()
                            });

                        }
                    });
                    self.AAbatterys.forEach(function(aaBattery){
                        if (checkCollisions(bomb.getPosition(), aaBattery.getPosition(), bomb.blast_radius)){
                            console.log('hit');
                            aaBattery.health -= bomb.damage;
                            AttackCtrl.saveAttack({
                                game: self.gameId,
                                type: "BOMB HIT MOBILE AA",
                                owner: bomb.owner.username,
                                target: aaBattery.owner.username,
                                x: bomb.getX(),
                                y: bomb.getY()
                            });

                            if (aaBattery.health <= 0){
                                AttackCtrl.saveAttack({
                                    game: self.gameId,
                                    type: "MOBILE AA DESTROYED",
                                    owner: bomb.owner.username,
                                    target: aaBattery.owner.username,
                                    asset: bomb.droppedBy.id,
                                    x: aaBattery.getX(),
                                    y: aaBattery.getY()
                                });

                            }

                        }
                    });

                    self.controlPoints.forEach(function(cp){
                        if (checkCollisions(bomb.getPosition(), cp.getPosition(), bomb.blast_radius)){
                            console.log('hit');
                            cp.health -= bomb.damage;
                            AttackCtrl.saveAttack({
                                game: self.gameId,
                                type: "BOMB HIT CONTROL POINT",
                                owner: bomb.owner.username,
                                x: bomb.getX(),
                                y: bomb.getY()
                            });

                            if (cp.health <= 0){
                                cp.health = 0;
                                AttackCtrl.saveAttack({
                                    game: self.gameId,
                                    type: "CONTROL POINT DESTROYED",
                                    owner: bomb.owner.username,
                                    asset: bomb.droppedBy.id,
                                    x: cp.getX(),
                                    y: cp.getY()
                                });

                            }

                        }
                    });

                    //    remove bomb

                    self.bombs.splice(i, 1);

                }
            });
        },
        updateFlaks: function(dt){
            var self = this;
            self.flaks.forEach(function(flak, i){
                console.log('updating a flak');
                if (flak.state === 'live'){
                    flak.update(dt);
                    self.bombers.forEach(function(bomber){
                        if (checkCollisions(flak.getPosition(), bomber.physical.position, 10)){
                            console.log('hit');
                            bomber.health -= flak.damage;
                            AttackCtrl.saveAttack({
                                game: self.gameId,
                                type: "FLAK HIT",
                                owner: flak.owner.username,
                                target: bomber.owner.username,
                                x: flak.getX().toFixed(3),
                                y: flak.getY().toFixed(3)
                            });

                            if (bomber.health <= 0){
                                AttackCtrl.saveAttack({
                                    game: self.gameId,
                                    type: "BOMBER DESTROYED",
                                    owner: flak.owner.username,
                                    target: bomber.owner.username,
                                    asset: flak.firedBy.id,
                                    x: bomber.getX().toFixed(3),
                                    y: bomber.getY().toFixed(3)
                                });
                            }
                            // remove flak from here, but also from Engine!
                            self.World.remove(engine.world, flak.physical);
                            self.flaks.splice(i, 1);
                        }
                    });
                }else{
                    console.log('removing flak ', i);
                    self.flaks.splice(i, 1);
                }


            });
        },
        addBomb : function(bomb){
            this.bombs.push(bomb);
        },
        addFlak : function(flak){
            this.flaks.push(flak);
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
            // debug("update called", t);
            // debug("update called getNano", getNanoTime());
            var dt = (t - this.lastUpdateTime); // used to be 1000000000
            debug("dt", dt);
            dt = dt/1000000;
            // debug("dt corrected?", dt);
            // debug("renderTime", this.renderTime);
            // debug ("this.running", this.running);
            this.lastUpdateTime = getNanoTime();
            this.runningTime += dt;
            self.handleInputs();
            // scale dt to slow down game. Remember to put it back for rendering
            dt = dt;
            moneyUpdate -= dt;
            // console.log('dt', dt);
            // console.log('before entity update ', Date.now());
            self.handleLocations();
            self.updateBombs(dt);
            self.updateFlaks(dt);
            self.playerEntities.forEach(function(ent){
                ent.update(dt);
                if(moneyUpdate<0 && ent.state !== 'wounded'){
                    ent.money += ent.moneyRate*moneyUpdateTime/5000;
                }
            });

            if(moneyUpdate<0){
                self.controlPoints.forEach(function(cp){
                    cp.update(moneyUpdateTime/5000);
                });
                moneyUpdate = Number(String(moneyUpdateTime));
            }
            self.bombers.forEach(function(bomber, index){
                if (bomber.running){
                    bomber.update(dt);
                }else{
                    // probably a bug here to do with bomber array in the playerEntity... should be a delete method.
                    self.World.remove(engine.world, bomber);
                    self.bombers.splice(index,1);
                }

            });
            self.AAbatterys.forEach(function(battery, index){
                if (battery.running){
                    battery.update(dt);
                }else{
                    // probably a bug here to do with bomber array in the playerEntity... should be a delete method.
                    self.World.remove(engine.world, battery.physical);
                    self.AAbatterys.splice(index,1);
                }
            });
            // console.log('----- Before Engine Update',Date.now());
            Engine.update(engine, dt);
            // console.log('----- engine update over', Date.now());
            // dt = dt/1000;
            this.renderTime += dt;
            // console.log('update: this.renderTime', this.renderTime);
            // console.log('engine update over', this.renderTime);

            if (this.renderTime>RENDER_TIME){
                render(this, nextState);
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
                    return (input.username === playEnt.username);
                })
                    .forEach(function(input, index, obj){
                        if (input.action === 'SEND_BOMBER') {
                            if (playEnt.bomber_ready > 0 && playEnt.state === 'living') {
                                console.log('playEnt has bomber_ready > 0', input.target);
                                proj.mapsToMetres(input.target);
                                console.log('target after conversion: ', input.target);
                                BomberFactory.newBomber(playEnt, self).setTarget(input.target.x, input.target.y);
                            }
                        } else if(input.action === 'SEND_BATTERY'){
                            if (playEnt.AA_ready > 0 && playEnt.state === 'living') {
                                console.log('playEnt has battery_ready > 0', input.destination);
                                proj.mapsToMetres(input.destination);
                                console.log('target after conversion: ', input.destination);
                                if (input.destination.x && input.destination.y){
                                    BatteryFactory.newBattery(playEnt, self).addDestination(input.destination.x, input.destination.y);
                                }else {
                                    console.log('send battery failed, inputs wrong format', input);
                                }

                            }
                        }else if (input.action === 'BUY_BOMBER'){
                            console.log('BUY_BOMBER', playEnt.username, playEnt.money);
                            if((playEnt.money >= 30) && playEnt.state === 'living'){
                                playEnt.bomber_ready ++;
                                playEnt.money -= 30;

                            }
                        }
                        else if (input.action === 'BUY_AA' ){
                            if((playEnt.money >= 30) && playEnt.state === 'living' && (playEnt.AA_ready + playEnt.AA_deployed) < 9){
                                playEnt.AA_ready ++;
                                playEnt.money -= 30;

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
                if (self.new_locations[playEnt.username]){
                    console.log('playEnt has location');
                    proj.mapsToMetres(self.new_locations[playEnt.username]);
                    // console.log('proj.x', self.new_locations[playEnt.userId].x);
                    playEnt.setPosition(self.new_locations[playEnt.username].x, self.new_locations[playEnt.username].y);
                    if (playEnt.state === 'living'){
                        self.controlPoints.forEach(function(cp){
                            cp.capture(playEnt);
                        });
                    }
                    self.new_locations[playEnt.username] = null;
                }
            })
        },
        pause : function(){this.running =false;},

        addPlayer : function(player){
            debug('adding player', player.username);
            console.log("player pushed");
            // this.players[player.userId] = player;  //^^2
            this.socketHandler.addPlayer(player);
            // this.arena.addPlayer(player);
            var newPlayerEntity = PlayerFactory.newPlayer(this.playerEntities.length +1, this.playerEntities.length +1, player, this);
            var cpClones = [];
            this.controlPoints.forEach((cp)=>{
                proj.metresToMaps(cp);
                cpClones.push(cp.createClone());
            });
            this.socketHandler.emit(player.username, 'control points', {points : cpClones});
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
            self.playerEntities.forEach(function(ent, i){
                if (ent.username === player.username){
                    //remove from world/physics list
                    index = i;
                    self.World.remove(engine.world, ent.physical);
                    self.playerEntities.splice(index, 1);
                }
            });
            // delete self.players[player.userId]; //^^4
            delete self.socketHandler.players[player.username];

            this.playerCount --;
            if (this.playerCount < 2){
                this.pause();
            }
            // debug('all bodies', this.World.bodies);
        },

        stop : function () {

        }
    };



    return game;
};


var getNanoTime = function() {
    var hrTime = process.hrtime();
    return (hrTime[0] * 1000000 + hrTime[1] / 1000);
};