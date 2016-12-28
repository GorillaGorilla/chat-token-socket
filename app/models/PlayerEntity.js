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
        gameId : game.gameId,
        username: player.username,
        physical: Bodies.rectangle(x, y, 10, 10),
        health: 100,
        playing : true,
        money:30,
        moneyRate: 0.005,
        points: 0,
        state: 'living',
        lat: x,
        lng: y,
        bomber_ready: 1,
        bomber_in_action: 0,
        bombers: [],
        battery_ready: 1,
        battery_in_action: 0,
        AAbatterys: [],
        renderString: "## Robot position " + player.username + ' ' + player.username + ' ' + this.lat + ' ' + this.lng,
        update: function (dt) {
            var self = this;
            if (self.health < 0){
                this.state = 'wounded';
            }
            // self.money += (self.moneyRate*dt)/1000;
        },
        getX: function(){
            return this.physical.position.x;
        },
        getY: function(){
            return this.physical.position.y;
        },
        setPosition : function(x, y){
            Matter.Body.setPosition(this.physical, {x: x, y: y});
        },
        getPosition : function () {
            return this.physical.position;
        },
        returnBomber : function(bomber){
            var self = this;
            self.bomber_ready ++;
            self.bomber_in_action --;
            self.bombers.forEach(function(ent, i){
                if (ent === bomber){
                    self.bombers.splice(i, 1);
                }
            });
        },
        sendBomberAccounting : function(bomber){
            this.bombers.push(bomber);
            this.bomber_ready --;
            this.bomber_in_action ++;
        }
    };



    var getState = function(){
        // cannot attach physical, gives circular reference when attempting to emit this obh=j.
        // instead this function creates an object with all the key details.
        var playerState = {};
        playerState.username = this.username;
        playerState.userId = this.userId;
        playerState.state = this.state;
        playerState.health = this.health;
        playerState.bomber_ready = this.bomber_ready;
        playerState.bomber_in_action = this.bomber_in_action;
        playerState.AA_ready = this.battery_ready;
        playerState.AA_deployed = this.battery_in_action;
        playerState.x = newPLayer.getX();
        playerState.y = newPLayer.getY();
        playerState.money = Math.floor(newPLayer.money);
        return playerState;
    };
    newPLayer.getState = getState;
    game.World.add(game.engine.world, newPLayer.physical);
    newPLayer.physical.collisionFilter.group = -1;
    return newPLayer;

};