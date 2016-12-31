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
        this.type = 'BOMBER';
        //update accounting for where the bomber is etc for easy access
        owner.sendBomberAccounting(this);

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
        var self = this;
        if (self.health <= 0){
            self.owner.bomber_in_action --;
            return self.running = false;
        }
        self.routine(dt);

        if (this.state ==='attack' && self.target && self.atTarget()){
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
        // this.lastDt = dt;
        // this.lastPos.x = this.getX();
        // this.lastPos.y = this.getY();
    }



}



module.exports = Bomber;