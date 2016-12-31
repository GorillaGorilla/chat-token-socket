/**
 * Created by frederickmacgregor on 04/12/2016.
 */
'use strict';

var Matter = require('matter-js'),
    Engine = Matter.Engine,
    Bodies = Matter.Bodies,
    Vector = Matter.Vector,
    Body =  Matter.Body,
    UUID = require('node-uuid');

exports.newFlak = function(x, y, velocity, game, parentBattery){
    var bomb = {
    };
    bomb.physical = Bodies.rectangle(x, y, 1, 1),
        bomb.state = 'live';
    bomb.fuse = 3000;  //seconds
    bomb.damage = 2;
    bomb.id = UUID();
    bomb.type = "FLAK";
    bomb.owner = parentBattery.owner;
    bomb.firedBy = parentBattery;
    bomb.update = function(dt){
        // console.log('flak update', bomb.fuse, dt, bomb.getX(), bomb.getY());
        bomb.fuse -= dt;
        //check collisions
        if (bomb.fuse < 0){
            bomb.state = 'expired';
        }
    };
    bomb.setVelocity = function(vector){
        Body.setVelocity(bomb.physical, vector);
    };
    bomb.getX = function(){return this.physical.position.x};
    bomb.getY = function(){return this.physical.position.y};
    bomb.getPosition = function(){return this.physical.position};
    bomb.setVelocity(velocity);

    var clone = function(){
        // console.log('clone called');
        var clone = {};
        clone.id = this.id;
        clone.state = this.state;
        clone.type = "FLAK";
        clone.damage = this.damage;
        // clone.playerId = this.owner.userId;
        clone.x = bomb.getX();
        clone.y = bomb.getY();
        return clone;
    };
    bomb.getState = clone;
    game.World.add(game.engine.world, bomb.physical);
    bomb.physical.collisionFilter.group = -1;
    return bomb;


};