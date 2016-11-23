/**
 * Created by frederickmacgregor on 23/11/2016.
 */
"use strict";
var Matter = require('matter-js'),
    Engine = Matter.Engine,
    Bodies = Matter.Bodies,
    Vector = Matter.Vector,
    Body =  Matter.Body;

exports.newPlayer = function(x, y, player, game){

    var newPLayer = {
        userId: player.userId || null,
        username: player.username,
        physical: Bodies.rectangle(x, y, 10, 10),
        health: 100,
        lat: x,
        lng: y,
        bomber_ready: 1,
        bomber_in_action: 0,
        bombers: [],
        renderString: "## Robot position " + player.username + ' ' + player.username + ' ' + this.lat + ' ' + this.lng,
        update: function (dt) {
            var self = this;

        },
        getX: function(){
            return this.physical.position.x;
        },
        getY: function(){
            return this.physical.position.y;
        },
        setPosition : function(x, y){
            Matter.Body.setPosition(this.physical, {x: x, y: y});
        }
    };

    var getState = function(){
        // cannot attach physical, gives circular reference when attempting to emit this obh=j.
        // instead this function creates an object with all the key details.
        var playerState = {};
        playerState.userId = this.userId;
        playerState.health = this.health;
        playerState.bomber_ready = this.bomber_ready;
        playerState.bomber_in_action = this.bomber_in_action;
        playerState.x = newPLayer.getX();
        playerState.y = newPLayer.getY();
        return playerState;
    };
    newPLayer.getState = getState;
    game.World.add(game.engine.world, newPLayer.physical);
    newPLayer.physical.collisionFilter.group = -1;
    return newPLayer;

};