/**
 * Created by frederickmacgregor on 27/12/2016.
 */

'use strict';
var GameObject = require('./gameobject.class'),
    Matter = require('matter-js'),
    Engine = Matter.Engine,
    Bodies = Matter.Bodies,
    Vector = Matter.Vector,
    Body =  Matter.Body;

class PlayerAsset extends GameObject {
    constructor(owner, game){
        super(owner.getX(), owner.getY());
        this.owner = owner;
        this.game = game;
        this.range = 50;
        this.accuracy= 30;
        this.target = null;
        this.state = 'attack';
        this.routine = null;

        game.World.add(game.engine.world, this.physical);
        // make bomber non coloding with players or bombers
        this.physical.collisionFilter.group = -1;
    }

    update(dt){
        console.log('update');
    }

    atTarget(){
        var self = this;
        if (((this.getX() - self.target.x)*(this.getX() - self.target.x) < 10 )
            &&  ((this.getY() - self.target.y)*(this.getY() - self.target.y) < 10 )){
            return true;
        }else {
            // console.log('-------------------- false ');
            return false;
        }
    }
    atBase(){
        var self = this;
        if (((self.getX() - self.owner.getX())*(self.getX() - self.owner.getX()) < 10 )
            &&  ((self.getY() - self.owner.getY())*(self.getY() - self.owner.getY()) < 10 )){
            return true;
        }else {
            // console.log('-------------------- false ');
            return false;
        }
    }
    setRoutine(routine){
        var self = this;
        self.routine = routine;
    }

    getOwner(){
        return this.owner;
    }

    createClone(){
        var clone = super.createClone();
        clone.owner = this.owner.username;
        return clone;
    }

}

module.exports = PlayerAsset;