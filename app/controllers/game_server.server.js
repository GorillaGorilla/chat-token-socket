/**
 * Created by GB115151 on 04/08/2016.
 */
"use strict;"
var game_server = module.exports = { games : {}, game_count:0 },
UUID = require('node-uuid'),
debug = require('debug')('http'),
    Matter = require('matter-js'),
    Engine = Matter.Engine,
    Bodies = Matter.Bodies;






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
    console.log("game: ", this.games[id]);
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
        Engine: Engine,
        // arena : arenaFactory(),
        inputs : {},
        startTime : 0,
        runningTime : 0,
        renderTime : 0,
        lastUpdateTime : 0,
        run : function() {
            this.running = true;
            console.log("running");
            for (var playerId in this.players){
                debug('player', playerId);
                this.players[playerId].emit('game start', {username: 'game', message : 'game starting'});
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
            this.playerEntities.forEach(function(robot){
                str = str + "## Robot position " + robot.userId + ' '+ robot.position.x +' '+ robot.position.y + '\n';
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
            this.Engine.update(engine, dt);


            this.renderTime += dt;
            if (this.renderTime>0.001){
                // this.arena.render();
                this.renderTime = 0;
                for (playerId in this.players){
                    debug('player', playerId);
                    this.players[playerId].emit('gameState', {username: 'game', message: this.writeState()});
                    this.players[playerId].emit('new message', {username: 'game', message: this.writeState()});
                }
            }
            if (this.running){
                debug("running is true");
                requestUpdateFrame(self, self.update.bind(self));
            }
        },
        handleInputs: function(){
            var self = this;
            this.playerEntities.forEach(function(robot){
                if (self.inputs[robot.userId]){
                    Matter.Body.setVelocity(robot, {x:inputs[robot.userId].x, y:inputs[robot.userId].y})
                    // robot.setDirection(inputs[robot.userId].x, inputs[robot.userId].y);
                }
                // robot.update(dt); removed as all updates now handled in the engine... except things like firing
                // bullets which will need to be done additionally... hmm
            });
        },
        pause : function(){this.running =false;},
        playerEntities: [],
        addPlayer : function(player){
            debug('adding player', player.userId);
            console.log("player pushed");
            this.players[player.userId] = player;
            // this.arena.addPlayer(player);
            var newRobot = robotFactory(this.playerEntities.length +1, this.playerEntities.length +1, player);
            this.World.add(engine.world, newRobot);
            this.playerEntities.push(newRobot);
            player.game = this;
            this.playerCount ++;
            console.log(this);
            if (this.playerCount >1){
                this.running = true;
                this.run();
            }
            debug('all bodies', this.World.bodies);
        },
        removePlayer : function(player){
            var self = this;
            debug('game.removePlayer called');
            // this.arena.removePlayer(player);
            this.playerEntities.forEach(function(ent){
                if (ent.userId === player.userId){
                    self.World.remove(engine.world, ent);
                }
            });
            this.playerCount --;
            if (this.playerCount < 2){
                this.pause();
            }
            debug('all bodies', this.World.bodies);
        },
        stop : function () {
            
        }
    }
};

var robotFactory = function(x, y, player){
    var robot = Bodies.rectangle(x, y, 40, 80);
    robot.userId = player.userId || null;
    robot.health = 10;
    robot.render = function(){
        console.log("## Robot position ", player.userId, player.username, this.position)
    };
    return robot;
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
            this.robots.push(robotFactory(this.robots.length +1, this.robots.length +1, player));
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

