/**
 * Created by frederickmacgregor on 04/12/2016.
 */
"use strict";
var Matter = require('matter-js'),
    Engine = Matter.Engine,
    Bodies = Matter.Bodies,
    Vector = Matter.Vector,
    Body =  Matter.Body,
    Flak = require('./Flak'),
    proj = require('../controllers/convert_maps');

exports.newBattery = function(playerEntity, game){
    // create a bomber at the same location as a player, with standard attributes and methods for dropping a bomb
    var reloadTime = 5000,
        timeToFire = 0,
        target = null;
    var battery = {
        physical: Bodies.rectangle(playerEntity.physical.position.x, playerEntity.physical.position.y, 10, 10),
        damage : 40,
        state : 'move',
        owner: playerEntity,
        range : 500,
        health: 60,
        running : true,
        accuracy: 30,
        line_of_sight : 500, // no idea of the scale here, guessing
        destination : null,
        speed: 0.2,
        lastPos: {x :null, y:null},
        lastDt: null,
        addDestination : function(x, y){
            var self = this;
            this.destination = Vector.create(x, y);
            // console.log('this.destination', this.destination);

            var posToDestination = Vector.sub(this.destination, this.physical.position);
            // console.log('posTodestination:', posTodestination);
            var distanceSq = Vector.magnitudeSquared(posToDestination) || 0.0001;
            // console.log('distanceSq', distanceSq);
            var normal = Vector.normalise(posToDestination);
            // console.log('normal', normal);
            Body.setVelocity(this.physical, Vector.mult(normal, this.speed));
            self.state = 'move';
            self.setRoutine(self.goTo(x, y, self));

        },
        fire : function(){
            // calculate vector between this object and target, and times by velocity
            var self = this;
            // console.log('this.destination', this.destination);
            var posToDestination = Vector.sub(target.getPosition(), this.physical.position);
            // console.log('posTodestination:', posTodestination);
            var distanceSq = Vector.magnitudeSquared(posToDestination) || 0.0001;
            // console.log('distanceSq', distanceSq);
            var normal = Vector.normalise(posToDestination);
            // console.log('normal', normal);
            var velocity = Vector.mult(normal, 10);
            Vector.add(velocity, Vector.create(Math.random()*10, Math.random()*10));
            var flak = Flak.newFlak(this.getX(), this.getY(), velocity, game, self.owner);
            game.addFlak(flak);
            console.log("flak added");
        },
        update : function(dt){
            var self = this;
            if (self.health <= 0){
                self.owner.battery_in_action --;
                return self.running = false;
            }
            if(timeToFire > 0){
                timeToFire -= dt;
            }
            // if (this.lastPos.x && this.lastDt){
            //     var dist = proj.distanceBetweenMetres({x:this.getX(),y:this.getY()}, this.lastPos);
            //     console.log('bomber distance covered', dist);
            //     var speed = dist/dt;
            //     console.log('bomber speed', speed);
            // }
            self.routine(dt);

            if (this.state ==='move' && self.destination && self.atDestination()){
                console.log('---------------------------------------- at destination');
                //    setdestination = null;
                //    return home
                self.destination = null;
                self.setRoutine(self.defend(self));
                self.state = 'defend';

            }else if(this.state === 'return' && self.atDestination()){
                // changed so that tests against destination rather than base, so it can still succeed if player moves.
                self.owner.battery_ready ++;
                self.owner.battery_in_action --;
                self.owner.AAbatterys.forEach(function(ent, i){
                    if (ent === self){
                        self.owner.bombers.splice(i, 1);
                    }
                });
                self.running = false;
            }
            this.lastDt = dt;
            this.lastPos.x = this.getX();
            this.lastPos.y = this.getY();
        },
        goTo : function(x, y, entity){
            console.log('goTo called');
            console.log('update battery to point towards destination', this.owner.username)
            return function(){
                console.log('goTo ', x , y);
                var self = entity;
                var destination = Vector.create(x, y);
                // console.log('destination', destination);

                var posTodestination = Vector.sub(destination, self.physical.position);
                // console.log('posTodestination:', posTodestination);
                // console.log('distanceSq', distanceSq);
                var normal = Vector.normalise(posTodestination);
                // console.log('normal', normal);
                Body.setVelocity(self.physical, Vector.mult(normal, this.speed));
            }
        },
        idle : function(){
            return function(){
                // do nothing};
            }
        },
        defend : function(){
            var self = this;
            return function(){
            //
                if (target && (target.health > 0) && target.running){
                    // check whether still in range, remove target if not and
                //    if it is in range, create a flak with a high velocity aiming at the target in line with accuracy
                //    call this function off the game, which will have the flakFactory and return so nothing else happens

                    var distanceVector = Vector.sub(self.getPosition(), target.getPosition());
                    console.log('distanceVector ', distanceVector);
                    var distanceSq = Vector.magnitudeSquared(distanceVector) || 0.0001;
                    console.log('distanceVector bomb, playEnt', distanceSq);
                    if (distanceSq < self.range*self.range){
                        console.log('in range!  firing!');
                        if (timeToFire <= 0){
                            timeToFire = Number(String(reloadTime));
                            return self.fire();
                        }

                    }
                }else{
                //    no target so first call look for target, scan all bombers to check within range
                    game.bombers.filter(function(bomber){
                        return bomber.owner !==self.owner;
                    })
                        .forEach(function(bomber){
                        var distanceVector = Vector.sub(self.getPosition(), bomber.getPosition());
                        console.log('distanceVector ', distanceVector);
                        var distanceSq = Vector.magnitudeSquared(distanceVector) || 0.0001;
                        console.log('distanceVector bomb, playEnt', distanceSq);
                        if (distanceSq < self.line_of_sight*self.line_of_sight){
                            console.log('found target');
                            target = bomber;
                        }
                    })
                }

            };
        },
        getX : function(){return this.physical.position.x},
        getY : function(){return this.physical.position.y},
        atDestination : function(){
            var self = this;

            if (((this.getX() - self.destination.x)*(this.getX() - self.destination.x) < 10 )
                &&  ((this.getY() - self.destination.y)*(this.getY() - self.destination.y) < 10 )){
                Body.setVelocity(this.physical, Vector.create(0,0));
                return true;
            }else {
                console.log('-------------------- false ');
                return false;
            }
        },
        atBase : function(){
            var self = this;
            if (((this.getX() - self.owner.getX())*(this.getX() - self.owner.getX()) < 10 )
                &&  ((this.getY() - self.owner.getY())*(this.getY() - self.owner.getY()) < 10 )){
                return true;
            }else {
                console.log('-------------------- false ');
                return false;
            }
        },
        setRoutine: function(routine){
            var self = this;
            self.routine = routine;
        },
        getPosition : function () {
            return this.physical.position;
        }

    };

    var clone = function(){
        // console.log('clone called');
        var clone = {};
        clone.damage = this.damage;
        clone.speed = this.speed;
        clone.type = "AA_TANK";
        clone.playerId = this.owner.userId;
        clone.line_of_sight = this.line_of_sight;
        clone.accuracy = this.accuracy;
        clone.x = battery.getX();
        clone.y = battery.getY();
        return clone;
    };
    battery.getState = clone;
    //add physical object to the game world so it will be processed in physics updates
    game.World.add(game.engine.world, battery.physical);
    //update accounting for where the bomber is etc for easy access
    playerEntity.AAbatterys.push(battery);
    playerEntity.battery_ready --;
    playerEntity.battery_in_action ++;
    game.AAbatterys.push(battery);
    // make bomber non coloding with players or bombers
    battery.physical.collisionFilter.group = -1;
    battery.setRoutine(battery.idle);
    return battery;

};