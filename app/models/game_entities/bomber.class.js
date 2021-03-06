/**
 * Created by frederickmacgregor on 27/12/2016.
 */
'use strict';
var PlayerAsset = require('./playerasset.class.js'),
    Routines = require('./../routines'),
    Matter = require('matter-js'),
    Engine = Matter.Engine,
    Bodies = Matter.Bodies,
    Vector = Matter.Vector,
    Body =  Matter.Body,
    Bomb = require('./Bomb'),
    Map = require('./category_filter_masks');

class Bomber extends PlayerAsset {
    constructor(owner, game){
        super(owner, game);
        game.bombers.push(this);
        this.setRoutine(Routines.idle);
        this.type = 'BOMBER';
        //update accounting for where the bomber is etc for easy access
        owner.sendBomberAccounting(this);
        this.physical.collisionFilter.group = 0;
        this.physical.collisionFilter.category = Map.BOMBER;
        this.state = 'attack';
        // simple way of simulating flying height
        this.climbSpeed = 0.100;
        this.altitude = 0;
        // single pipe is bitwise ADD
        this.physical.collisionFilter.mask = Map.FLAK;
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

    takeDamage(damage){
        var self = this;
        if(self.altitude < 1000){
            return self.health -= (damage * 2);
        }else {
            return self.health -= damage;
        }
    }

    update(dt){
        var self = this;
        // console.log('update bomber');
        if (self.health <= 0){
            self.owner.bomber_in_action --;
            return self.running = false;
        }

        if (self.altitude < 1000){
            self.altitude += self.climbSpeed * dt;
        }
        self.routine(dt);

        if ((this.state ==='attack'|| this.state ==='takeoff') && self.target && self.atTarget()){
            console.log('---------------------------------------- at target');
            self.dropBomb();
            //    setTarget = null;
            //    return home
            self.target = null;
            self.setRoutine(Routines.goTo(self.owner.getX(), self.owner.getY(), self));
            self.state = 'return';
            self.setTarget(self.owner.getX(),self.owner.getY());

        }else if(this.state === 'return' && self.atTarget()){
            // changed so that tests against target rather than base, so it can still succeed if player moves.
            self.owner.returnBomber(self);
            self.running = false;
            // game.World.engine
        }

        self.flyingTime += dt;


        // this.lastDt = dt;
        // this.lastPos.x = this.getX();
        // this.lastPos.y = this.getY();
    }



    dropBomb (){
        this.game.addBomb(Bomb.newBomb((this.getX()+Math.random()*5)-2.5,
            (this.getY()+Math.random()*5)-2.5, this));
        console.log("bomb dropped");
    }

}



module.exports = Bomber;