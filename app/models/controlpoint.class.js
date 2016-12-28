/**
 * Created by frederickmacgregor on 28/12/2016.
 */
"use strict";
var GameObject  = require('./gameobject.class');


class ControlPoint extends GameObject {
    constructor (x, y, name, time){
        super(x, y);
        this.lastVisitedTime = null;  //
        this.lastUpdatedTime = Date.now();
        this.name = name || 'unnamed';
        this.frequencyOfVisits = time || 60000; // sets how often a player can visit
        this.speed = 0; //doesn't move
        this.naturalRegeneration = 0.005;
        this.maxHealth = 50;
    }

    capture(playerEntity){
        // Accepts a player, and gives them money depending on the state of the control point
        if (this.isVisitable()){
            if (this.checkCollisionObj(playerEntity, 30)){
                playerEntity.money += this.health;
                this.lastVisitedTime = Date.now();
            }
        }
    }

    isVisitable(){
        return !this.lastVisitedTime ? ((Date.now() - this.lastVisitedTime) >= this.frequencyOfVisits) : true;
    }

    update(dt){
        // regenerates health
        if (this.health < this.maxHealth){
            this.health += dt*this.naturalRegeneration;
        }
    }

}

module.exports = ControlPoint;