/**
 * Created by frederickmacgregor on 27/12/2016.
 */
'use strict';

var Matter = require('matter-js'),
    UUID = require('node-uuid'),
    Engine = Matter.Engine,
    Bodies = Matter.Bodies,
    Vector = Matter.Vector,
    Body =  Matter.Body;


class GameObject {
    constructor(x, y) {
        this.physical = Bodies.circle(x, y, 5);
        this.id = UUID();
        this.radius = 5;

        this.running = true;
        this.speed= 0.3;
        this.damage = 40;
        this.health= 50;
        this.line_of_sight = 50;
    }
    getX(){
        return this.physical.position.x;
    }
    getY(){
        return this.physical.position.y;
    }
    setPosition(x, y){
        Matter.Body.setPosition(this.physical, {x: x, y: y});
    }
    getPosition() {
        return this.physical.position;
    }

    setVelocity(vector) {
        Body.setVelocity(this.physical, vector);
    };

    checkCollisionObj (gameObj, distance){
        //    return true or false
        var distanceVector = Vector.sub(this.getPosition(), gameObj.getPosition());
        // console.log('distanceVector checkCOllision method', distanceVector);
        var distanceSq = Vector.magnitudeSquared(distanceVector) || 0.0001;
        // console.log('distanceVector distanceSq checkCollision method', distanceSq);
        return distanceSq < (distance*distance)

    }

    checkCollisionPoint (vector, distance){
        //    return true or false
        var distanceVector = Vector.sub(this.getPosition(), vector);
        // console.log('distanceVector checkCOllision method', distanceVector);
        var distanceSq = Vector.magnitudeSquared(distanceVector) || 0.0001;
        // console.log('distanceVector distanceSq checkCollision method', distanceSq);
        return distanceSq < (distance*distance)

    }

    createClone(){
        var clone = {};
        for( var att in this){
            if(att !== 'physical' && att !== 'owner' && att !== 'game' && att !== 'routine'&& att !== 'AAbatterys' && att !== 'bombers' && att !== 'target'){
                clone[att] = this[att];
            }else if (att === 'owner'){
                if(this[att]){
                //    owner attribute is initialised as null, so only try to copy across the username if its been set
                    clone[att] = this[att].username;

                }

            }
        }
        clone.radius = this.radius*6.06;
        clone.x = this.getX();
        clone.y = this.getY();

        return clone;
    }
}

module.exports = GameObject;