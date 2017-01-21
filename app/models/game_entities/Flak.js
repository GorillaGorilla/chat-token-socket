/**
 * Created by frederickmacgregor on 04/12/2016.
 */
'use strict';

var Matter = require('matter-js'),
    Engine = Matter.Engine,
    Bodies = Matter.Bodies,
    Vector = Matter.Vector,
    Body =  Matter.Body,
    UUID = require('node-uuid'),
    Map = require('./category_filter_masks'),
    GameObject = require('./gameobject.class');

class Flak extends GameObject{
    constructor(x, y, velocity, game, parentBattery){
        super(x, y);
        this.physical = Bodies.circle(x, y, 0.5);
        this.radius = 0.5;
        this.type = "FLAK";
        this.fuse = 3000;
        this.damage = 2;
        this.state = 'live';
        this.owner = parentBattery.owner;
        this.physical.collisionFilter.group = 0;
        this.playerId = parentBattery.owner.id;
        this.physical.collisionFilter.category = Map.FLAK;

        // single & is bitwise ADD
        this.physical.collisionFilter.mask = Map.BOMBER;
        console.log('FLAK collisionFilter.category: ', this.physical.collisionFilter.category);
        console.log('FLAK collisionFilter.mask: ', this.physical.collisionFilter.mask);
        this.setVelocity(velocity);
        Body.setVelocity(this.physical, velocity);  //other one isnt working soo......?
        game.World.add(game.engine.world, this.physical);
    }

    update(dt){
        this.fuse -= dt;
        //check collisions
        if (this.fuse < 0){
            this.state = 'expired';
        }
    }

    setVelocity(vector) {
        Body.setVelocity(this.physical, vector);
    };

    createClone(){
        var clone = super.createClone();
        return clone;
    }
}

exports.newFlak = function(x, y, velocity, game, parentBattery){

    var flak = new Flak(x, y, velocity, game, parentBattery);
    // var bomb = {
    // };
    // bomb.physical = Bodies.rectangle(x, y, 1, 1),
    //     bomb.state = 'live';
    // bomb.fuse = 3000;  //seconds
    // bomb.damage = 2;
    // bomb.id = UUID();
    // bomb.type = "FLAK";
    // bomb.owner = parentBattery.owner;
    // bomb.firedBy = parentBattery;
    // bomb.update = function(dt){
    //     // console.log('flak update', bomb.fuse, dt, bomb.getX(), bomb.getY());
    //     bomb.fuse -= dt;
    //     //check collisions
    //     if (bomb.fuse < 0){
    //         bomb.state = 'expired';
    //     }
    // };
    // bomb.setVelocity = function(vector){
    //     Body.setVelocity(bomb.physical, vector);
    // };
    // bomb.getX = function(){return this.physical.position.x};
    // bomb.getY = function(){return this.physical.position.y};
    // bomb.getPosition = function(){return this.physical.position};
    // bomb.setVelocity(velocity);
    //
    // var clone = function(){
    //     // console.log('clone called');
    //     var clone = {};
    //     clone.id = this.id;
    //     clone.state = this.state;
    //     clone.type = "FLAK";
    //     clone.damage = this.damage;
    //     // clone.playerId = this.owner.userId;
    //     clone.x = bomb.getX();
    //     clone.y = bomb.getY();
    //     return clone;
    // };
    // bomb.getState = clone;
    // game.World.add(game.engine.world, bomb.physical);
    // bomb.physical.collisionFilter.group = 0;
    // bomb.physical.collisionFilter.category = Map.FLAK;
    // // single pipe is bitwise ADD
    // bomb.physical.collisionFilter.mask = Map.BOMBER ;
    // console.log('FLAK collisionFilter.category: ', bomb.physical.collisionFilter.category);
    // console.log('FLAK collisionFilter.mask: ', bomb.physical.collisionFilter.mask);
    return flak;


};