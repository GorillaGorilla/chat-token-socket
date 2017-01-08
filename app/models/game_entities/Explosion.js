/**
 * Created by frederickmacgregor on 08/01/2017.
 */
"use strict";

var GameObject = require('./gameobject.class');


class Explosion extends GameObject{
    constructor(x, y, radius){
        super(x, y);
        this.fuse = 2000;
        this.initialFuse = 2000;
        this.radius = radius;
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
        clone.radius = clone.radius*6.06;
        return clone;
    }
}

module.exports = Explosion;