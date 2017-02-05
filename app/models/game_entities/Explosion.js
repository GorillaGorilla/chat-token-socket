/**
 * Created by frederickmacgregor on 08/01/2017.
 */
"use strict";

var GameObject = require('./gameobject.class'),
    Map = require('./category_filter_masks'),
    Matter = require('matter-js'),
    UUID = require('node-uuid'),
    Engine = Matter.Engine,
    Bodies = Matter.Bodies,
    Vector = Matter.Vector,
    Body =  Matter.Body;


class Explosion extends GameObject{
    constructor(x, y, radius, owner){
        super(x, y);
        console.log('explosion radius', radius);
        this.fuse = 2000;
        this.initialFuse = 2000;
        this.owner = owner;
        this.physical = Bodies.circle(x, y, radius,{mass: 0.000001});
        this.physical.goRef = this;
        // Body.setStatic(this.physical, true);
        this.radius = radius;
        this.type = 'EXPLOSION';
        this.physical.collisionFilter.group = 0;
        this.physical.collisionFilter.category = Map.EXPLOSION;
        // single & is bitwise ADD
        // this.physical.collisionFilter.mask =  Map.PLAYER | Map.MOBILE_AA;
        // console.log('EXPLOSION collisionFilter.category: ', this.physical.collisionFilter.category);
        // console.log('EXPLOSION collisionFilter.mask: ', this.physical.collisionFilter.mask);
        // owner.game.World.add(owner.game.engine.world, this.physical);
    }

    update(dt){
        this.fuse -= dt;
        //check collisions
        if (this.fuse < 0){
            this.state = 'expired';
            this.running = false;
        }
    }

    createClone(){
        var clone = super.createClone();
        // console.log('clone', clone);
        return clone;
    }
}

module.exports = Explosion;