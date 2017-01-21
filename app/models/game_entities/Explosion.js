/**
 * Created by frederickmacgregor on 08/01/2017.
 */
"use strict";

var GameObject = require('./gameobject.class'),
    Map = require('./category_filter_masks');


class Explosion extends GameObject{
    constructor(x, y, radius){
        super(x, y);
        this.fuse = 2000;
        this.initialFuse = 2000;
        this.radius = radius;
        this.physical.collisionFilter.group = 0;
        this.physical.collisionFilter.category = Map.EXPLOSION;
        // single pipe is bitwise ADD
        this.physical.collisionFilter.mask = Map.MOBILE_AA & Map.PLAYER;
        console.log('EXPLOSION collisionFilter.category: ', this.physical.collisionFilter.category);
        console.log('EXPLOSION collisionFilter.mask: ', this.physical.collisionFilter.mask);
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
        return clone;
    }
}

module.exports = Explosion;