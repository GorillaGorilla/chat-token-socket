/**
 * Created by frederickmacgregor on 28/12/2016.
 */
"use strict";
var GameObject  = require('./gameobject.class.js');


class ControlPoint extends GameObject {
    constructor (x, y, name, time){
        super(x, y);
        this.lastVisitedTime = null;  //
        this.lastUpdatedTime = Date.now();
        this.name = name || 'unnamed';
        this.frequencyOfVisits = time || 3600000; // sets how often a player can visit default to 1 hour.
        this.speed = 0; //doesn't move
        this.naturalRegeneration = 0.005;
        this.maxHealth = 50;
        this.owner = null;
        this.temp = 0;
    }

    capture(playerEntity){
        // Accepts a player, and gives them money depending on the state of the control point
        if (this.isVisitable()){
            if (this.checkCollisionObj(playerEntity, 30)){
                // console.log('point captured, calcs:',(this.temp));
                // console.log('lastVisitedTime',this.lastVisitedTime);
                // console.log('difference',(this.temp - this.lastVisitedTime));
                // console.log('frequencyOfVisits',(this.frequencyOfVisits));
                // console.log((this.temp - this.lastVisitedTime) >= this.frequencyOfVisits);
                console.log(playerEntity.username + ' ' + playerEntity.getPosition() +' captured CP ',this.name, ' ', this.getPosition(), ' at time', new Date());
                playerEntity.money += this.health;
                this.lastVisitedTime = Date.now();
                this.owner = playerEntity;
            }
        }
    }

    isVisitable(){
        this.temp = Date.now();

        // if (this.lastVisitedTime){
        //     return ((this.temp - this.lastVisitedTime) >= this.frequencyOfVisits)
        // }else{
        //
        // }

        return (this.lastVisitedTime) ? ((this.temp - this.lastVisitedTime) >= this.frequencyOfVisits) : true;
    }

    update(dt){
        // regenerates health
        if(this.health === this.maxHealth){
            return;
        }

        if (this.health < this.maxHealth){
            this.health += dt*this.naturalRegeneration;
        }else{
            this.health = Number(String(this.maxHealth));
        }
    }

}

module.exports = ControlPoint;