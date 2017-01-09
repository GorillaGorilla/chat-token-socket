/**
 * Created by frederickmacgregor on 31/12/2016.
 */
"use strict";

var PlayerAsset = require('./playerasset.class.js'),
    Routines = require('./../routines'),
    Matter = require('matter-js'),
    Engine = Matter.Engine,
    Bodies = Matter.Bodies,
    Vector = Matter.Vector,
    Body =  Matter.Body,
    Flak = require('./Flak');

class MobileAA extends PlayerAsset {
    constructor(owner, game){
        super(owner, game);
        game.AAbatterys.push(this);
        this.setRoutine(Routines.idle);
        this.type = 'MOBILE_AA';
        this.health = 60;
        this.damage = 40;
        this.state = 'move';
        this.range = 500;
        this.accuracy = 30;
        this.destination = null;
        this.speed = 0.2;
        this.line_of_sight = 500;
        this.timeToFire = 0;
        this.reloadTime = 5000;
        this.target = null;
        this.setRoutine(Routines.idle());
        //update accounting for where the bomber is etc for easy access
        // console.log('this.owner', this.owner);
        this.owner.sendAAAcounting(this);

    }

    setTarget(x, y){
        var self = this;
        this.target = Vector.create(x, y);
        // console.log('this.target', this.target);

        var posToTarget = Vector.sub(this.target, this.physical.position);
        // console.log('posToTarget:', posToTarget);
        var distanceSq = Vector.magnitudeSquared(posToTarget) || 0.0001;
        // console.log('distanceSq', distanceSq);
        var normal = Vector.normalise(posToTarget);
        // console.log('normal', normal);
        Body.setVelocity(this.physical, Vector.mult(normal, this.speed));

        self.setRoutine(Routines.goTo(x, y, self));
    }

    update(dt){
        // console.log('update AA battery');
        var self = this;
        if (self.health <= 0){
            self.owner.AA_deployed --;
            self.AA_lost ++;
            return self.running = false;
        }
        if(this.timeToFire > 0){
            this.timeToFire -= dt;
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
            self.setRoutine(Routines.defend(self));
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
        // this.lastDt = dt;
        // this.lastPos.x = this.getX();
        // this.lastPos.y = this.getY();
    }

    atDestination(){
        var self = this;

        if (((this.getX() - self.destination.x)*(this.getX() - self.destination.x) < 10 )
            &&  ((this.getY() - self.destination.y)*(this.getY() - self.destination.y) < 10 )){
            Body.setVelocity(this.physical, Vector.create(0,0));
            return true;
        }else {
            // console.log('-------------------- false ');
            return false;
        }
    }

    atBase(){
        var self = this;
        if (((this.getX() - self.owner.getX())*(this.getX() - self.owner.getX()) < 10 )
            &&  ((this.getY() - self.owner.getY())*(this.getY() - self.owner.getY()) < 10 )){
            return true;
        }else {
            // console.log('-------------------- false ');
            return false;
        }
    }




    addDestination(x, y){
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
        self.setRoutine(Routines.goTo(x, y, self));

    }
    fire(){
        console.log('fire');
        // calculate vector between this object and target, and times by velocity
        var self = this;
        // console.log('this.destination', this.destination);
        var posToDestination = Vector.sub(self.target.getPosition(), self.getPosition());
        // console.log('posTodestination:', posTodestination);
        var distanceSq = Vector.magnitudeSquared(posToDestination) || 0.0001;
        // console.log('distanceSq', distanceSq);
        var normal = Vector.normalise(posToDestination);
        // console.log('normal', normal);
        var velocity = Vector.mult(normal, 10);
        var newVel = Vector.add(velocity, Vector.create(Math.random()*3, Math.random()*3));
        var flak = Flak.newFlak(this.getX(), this.getY(), newVel, this.game, self);
        this.game.addFlak(flak);
        console.log("flak added");
    }


}


module.exports = MobileAA;