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
    Body =  Matter.Body;






var requestUpdateFrame;

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
game_server.createGame = function(player){
    var id = UUID();
    this.games[id] = gameFactory();
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

var gameFactory = function(){
    var World = Matter.World;

// create an engine
    var engine = Engine.create();

    engine.world.gravity.y = 0;
// create two boxes and a ground
    var boxA = Bodies.rectangle(400, 200, 80, 80);
    var boxB = Bodies.rectangle(450, 50, 80, 80);
    var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

// add all of the bodies to the world
    World.add(engine.world, [ground]);




    return {
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
        run : function() {
            var self = this;
            self.running = true;
            console.log("running");
            for (var playerId in this.players){
                debug('player', playerId);
                self.players[playerId].emit('new message', {username: 'game', message : 'game starting, ' + self.playerCount + ' players.'});
            }
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
            self = this;
            debug("update called", t);
            var dt = (t - this.lastUpdateTime)/1000000000;
            debug("dt", dt);
            debug ("this.running", this.running)
            this.lastUpdateTime = getNanoTime();
            this.runningTime += dt;
            this.handleInputs();
            // this.arena.update(dt, this.inputs);
            this.handleLocations();
            self.playerEntities.forEach(function(ent){
                ent.update(dt);
            });
            self.bombers.forEach(function(bomber, index){
                if (bomber.running){
                    bomber.update(dt);
                }else{
                    self.bombers.splice(index,1);
                }

            });
            // console.log('handle locations over');
            Engine.update(engine, dt);
            // console.log('engine update over', dt);
            this.renderTime += dt;
            // console.log('update: this.renderTime', this.renderTime);
            // console.log('engine update over', this.renderTime);
            if (this.renderTime>50000.001){
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
                for (playerId in this.players){
                    debug('player', playerId);
                    // console.log('assets', assets);
                    // console.log('playerStates', playerStates);
                    console.log('emitting to: ', this.players[playerId].username);
                    this.players[playerId].emit('gameState', {players: playerStates,
                    assets: assets});

                    // console.log('gameState emitted');
                    // this.players[playerId].emit('new message', {username: 'game', message: this.writeState()});
                }
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
                            if (playEnt.bomber_ready > 0) {
                                console.log('playEnt has bomber_ready > 0', input.target);
                                proj.mapsToMetres(input.target);
                                console.log('target after conversion: ', input.target);
                                bomberFactory(playEnt, self).addTarget(input.target.x, input.target.y);
                            }
                        }
                        self.inputs.splice(index, 1); //remove input after its taken care of

                    });
            });

        //    change inputs to array, as there could (potentially) be more than one input per tick per player

        },
        handleLocations: function(){
            var self = this;
            self.playerEntities.forEach(function(playEnt){
                if (self.new_locations[playEnt.userId]){
                    console.log('playEnt has location');
                    proj.mapsToMetres(self.new_locations[playEnt.userId]);
                    console.log('proj.x', self.new_locations[playEnt.userId].x);
                    Matter.Body.setPosition(playEnt.physical, {x: self.new_locations[playEnt.userId].x, y: self.new_locations[playEnt.userId].y});
                    self.new_locations[playEnt.userId] = null;
                }
            })
            
        },
        pause : function(){this.running =false;},
        playerEntities: [],
        addPlayer : function(player){
            debug('adding player', player.userId);
            console.log("player pushed");
            this.players[player.userId] = player;
            // this.arena.addPlayer(player);
            var newPlayerEntity = playerFactory(this.playerEntities.length +1, this.playerEntities.length +1, player, this);

            this.playerEntities.push(newPlayerEntity);
            player.game = this;
            this.playerCount ++;
            console.log(this);
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
                this.playerEntities.slice(index, 1);
            }
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

var playerFactory = function(x, y, player, game){
    
    var newPLayer = {
        userId: player.userId || null,
        username: player.username,
        physical: Bodies.rectangle(x, y, 10, 10),
        health: 100,
        lat: x,
        lng: y,
        bomber_ready: 1,
        bomber_in_action: 0,
        bombers: [],
        renderString: "## Robot position " + player.username + ' ' + player.username + ' ' + this.lat + ' ' + this.lng,
        update: function (dt) {
            var self = this;

        },
        getX: function(){
            return this.physical.position.x;
        },
        getY: function(){
            return this.physical.position.y;
        }
    };

    var getState = function(){
        // cannot attach physical, gives circular reference when attempting to emit this obh=j.
        var playerState = {};
        playerState.userId = this.userId;
        playerState.health = this.health;
        playerState.bomber_ready = this.bomber_ready;
        playerState.bomber_in_action = this.bomber_in_action;
        playerState.x = newPLayer.getX();
        playerState.y = newPLayer.getY();
        return playerState;
    };
    newPLayer.getState = getState;
    game.World.add(game.engine.world, newPLayer.physical);
    newPLayer.physical.collisionFilter.group = -1;
    return newPLayer;

};

var bomberFactory = function(playerEntity, game){
    // create a bomber at the same location as a player, with standard attributes and methiods for dropping a bomb


    var bomber = {
        physical: Bodies.rectangle(playerEntity.physical.position.x, playerEntity.physical.position.y, 10, 10),
        damage : 40,
        state : 'attack',
        owner: playerEntity,
        range : 50,
        running : true,
        accuracy: 30,
        line_of_sight : 50,
        target : null,
        speed: 3,
        addTarget : function(x, y){
            var self = this;
            this.target = Vector.create(x, y);
            console.log('this.target', this.target);

            var posToTarget = Vector.sub(this.target, this.physical.position);
                console.log('posToTarget:', posToTarget);
                var distanceSq = Vector.magnitudeSquared(posToTarget) || 0.0001;
            console.log('distanceSq', distanceSq);
                var normal = Vector.normalise(posToTarget);
            console.log('normal', normal);
            Body.setVelocity(this.physical, Vector.mult(normal, this.speed));

            self.setRoutine(self.goTo(x, y, self));

        },
        dropBomb : function(){
            console.log("bomb dropped");
        },
        update : function(dt){
            var self = this;
            console.log('update bomber to point towards target', this.owner.username);
            self.routine(dt);

            if (this.state ==='attack'&&self.target && self.atTarget()){
                console.log('---------------------------------------- at target');
            //    drop bomb
            //    setTarget = null;
            //    return home
                self.target = null;
                self.setRoutine(self.goTo(self.owner.getX(), self.owner.getY(), self));
                self.state = 'return';

            }else if(this.state === 'return' && self.atBase()){
                self.owner.bomber_ready ++;
                self.owner.bomber_in_action --;
                self.running = false;
            }

        },
        goTo : function(x, y, entity){
            console.log('goTo called');
            return function(){
                console.log('goTo ', x , y);
                var self = entity;
                var destination = Vector.create(x, y);
                console.log('destination', destination);

                var posToTarget = Vector.sub(destination, self.physical.position);
                console.log('posToTarget:', posToTarget);
                var distanceSq = Vector.magnitudeSquared(posToTarget) || 0.0001;
                console.log('distanceSq', distanceSq);
                var normal = Vector.normalise(posToTarget);
                console.log('normal', normal);
                Body.setVelocity(self.physical, Vector.mult(normal, this.speed));
            }
        },
        idle : function(){
            return function(){
                // do nothing};
            }
        },
        getX : function(){return this.physical.position.x},
        getY : function(){return this.physical.position.y},
        atTarget : function(){
            var self = this;

            if (((this.getX() - self.target.x)*(this.getX() - self.target.x) < 40 )
                &&  ((this.getY() - self.target.y)*(this.getY() - self.target.y) < 40 )){
                return true;
            }else {
                console.log('-------------------- false ');
                return false;
            }
    },
        atBase : function(){
            var self = this;
            if (((this.getX() - self.owner.getX())*(this.getX() - self.owner.getX()) < 40 )
                &&  ((this.getY() - self.owner.getY())*(this.getY() - self.owner.getY()) < 40 )){
                return true;
            }else {
                console.log('-------------------- false ');
                return false;
            }
        },
        setRoutine: function(routine){
        var self = this;
            self.routine = routine;
        }

    };

    var clone = function(){
        console.log('clone called');
        var clone = {};
        clone.damage = this.damage;
        clone.speed = this.speed;
        clone.playerId = this.owner.userId;
        clone.line_of_sight = this.line_of_sight;
        clone.accuracy = this.accuracy;
        clone.x = bomber.getX();
        clone.y = bomber.getY();
        return clone;
    };
    bomber.getState = clone;
    //add physical object to the game world so it will be processed in physics updates
    game.World.add(game.engine.world, bomber.physical);
    //update accounting for where the bomber is etc for easy access
    playerEntity.bombers.push(bomber);
    playerEntity.bomber_ready --;
    playerEntity.bomber_in_action ++;
    game.bombers.push(bomber);
    // make bomber non coloding with players or bombers
    bomber.physical.collisionFilter.group = -1;
    bomber.setRoutine(bomber.idle);
    return bomber;

};

var arenaFactory = function(){

    return {
        spaceEmpty : function(x,y){
            if (isundefined(this[x + ',' + y])){
                return true;
            }
        },
        robots : [],
        lazers : [],
        update: function (dt, inputs){
            this.robots.forEach(function(robot){
                if (inputs[robot.id]){
                    robot.setDirection(inputs[robot.id].x, inputs[robot.id].y);
                }
                robot.update(dt);
            });
            this.lazers.forEach(function(dt){
                lazer.update(dt);
            });
        },
        render : function(){
            this.robots.forEach(function(robot){
                robot.render();
            });
        },
        addPlayer : function(player){
            this.robots.push(playerFactory(this.robots.length +1, this.robots.length +1, player));
        },
        removePlayer : function(player){
            debug('arena.removePlayer called');
            debug("this.robots",this.robots);
            var index = this.robots.findIndex(function(robot){
                return robot.id === player.userId;
            });
            this.robots.splice(index, index + 1);
            debug("this.robots",this.robots, index);
            this.playerCount --;

        }
    }
};

var lazerFactory = function(x, y){
    return {
        position : Victor(x, y),
        direction : Victor(x, y),
        update : function(dt){

        }
    }
};

var getNanoTime = function() {
    var hrTime = process.hrtime();
    return (hrTime[0] * 1000000 + hrTime[1] / 1000);
};

