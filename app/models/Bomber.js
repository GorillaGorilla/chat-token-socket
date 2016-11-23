/**
 * Created by frederickmacgregor on 23/11/2016.
 */
"use strict";
var Matter = require('matter-js'),
    Engine = Matter.Engine,
    Bodies = Matter.Bodies,
    Vector = Matter.Vector,
    Body =  Matter.Body;

exports.newBomber = function(playerEntity, game){
    // create a bomber at the same location as a player, with standard attributes and methods for dropping a bomb
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