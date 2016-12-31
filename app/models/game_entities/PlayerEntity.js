/**
 * Created by frederickmacgregor on 23/11/2016.
 */
"use strict";
var Matter = require('matter-js'),
    Engine = Matter.Engine,
    Bodies = Matter.Bodies,
    Vector = Matter.Vector,
    Body =  Matter.Body;

var GameObject = require('./gameobject.class.js');

class PlayerEntity extends GameObject {
    constructor(x, y, player, game){
        super(x, y);
        this.username = player.username;
        this.game = game;
        this.playing = true;
        this.money=50;
        this.moneyRate= 0.005;
        this.points= 0;
        this.state= 'living';
        this.lat= x;
        this.lng= y;
        this.bomber_ready= 1;
        this.bomber_in_action= 0;
        this.bombers = [];
        this.AA_ready = 1;
        this.AA_deployed = 0;
        this.AAbatterys= [];
        this.AA_lost = 0;
        this.bombers_lost = 0;

        game.World.add(game.engine.world, this.physical);
        this.physical.collisionFilter.group = -1;
    }

    get gameId(){
        return this.game.gameId;
    }

    update(dt){
        var self = this;
        if (self.health < 0){
            this.state = 'wounded';
        }
    }

    returnBomber(bomber){
        var self = this;
        self.bomber_ready ++;
        self.bomber_in_action --;
        self.bombers.forEach(function(ent, i){
            if (ent === bomber){
                self.bombers.splice(i, 1);
            }
        });
    }

    sendBomberAccounting(bomber) {
        this.bombers.push(bomber);
        this.bomber_ready--;
        this.bomber_in_action++;
    }

    sendAAAcounting(aa){
        this.AAbatterys.push(aa);
        this.AA_ready--;
        this.AA_deployed++;
    }

    returnAA(aa){
        var self = this;
        self.AA_ready ++;
        self.AA_deployed --;
        self.AAbatterys.forEach(function(ent, i){
            if (ent === aa){
                self.AAbatterys.splice(i, 1);
            }
        });
    }


}

exports.newPlayer = function(x, y, player, game){

    // var newPLayer = {
    //     userId: player.userId || null,
    //     gameId : game.gameId,
    //     username: player.username,
    //     physical: Bodies.rectangle(x, y, 10, 10),
    //     health: 100,
    //     playing : true,
    //     money:30,
    //     moneyRate: 0.005,
    //     points: 0,
    //     state: 'living',
    //     lat: x,
    //     lng: y,
    //     bomber_ready: 1,
    //     bomber_in_action: 0,
    //     bombers: [],
    //     battery_ready: 1,
    //     battery_in_action: 0,
    //     AAbatterys: [],
    //     renderString: "## Robot position " + player.username + ' ' + player.username + ' ' + this.lat + ' ' + this.lng,
    //     update: function (dt) {
    //         var self = this;
    //         if (self.health < 0){
    //             this.state = 'wounded';
    //         }
    //         // self.money += (self.moneyRate*dt)/1000;
    //     },
    //     getX: function(){
    //         return this.physical.position.x;
    //     },
    //     getY: function(){
    //         return this.physical.position.y;
    //     },
    //     setPosition : function(x, y){
    //         Matter.Body.setPosition(this.physical, {x: x, y: y});
    //     },
    //     getPosition : function () {
    //         return this.physical.position;
    //     },
    //     returnBomber : function(bomber){
    //         var self = this;
    //         self.bomber_ready ++;
    //         self.bomber_in_action --;
    //         self.bombers.forEach(function(ent, i){
    //             if (ent === bomber){
    //                 self.bombers.splice(i, 1);
    //             }
    //         });
    //     },
    //     sendBomberAccounting : function(bomber){
    //         this.bombers.push(bomber);
    //         this.bomber_ready --;
    //         this.bomber_in_action ++;
    //     }
    // };
    //
    //
    //
    // var getState = function(){
    //     // cannot attach physical, gives circular reference when attempting to emit this obh=j.
    //     // instead this function creates an object with all the key details.
    //     var playerState = {};
    //     playerState.username = this.username;
    //     playerState.userId = this.userId;
    //     playerState.state = this.state;
    //     playerState.health = this.health;
    //     playerState.bomber_ready = this.bomber_ready;
    //     playerState.bomber_in_action = this.bomber_in_action;
    //     playerState.AA_ready = this.battery_ready;
    //     playerState.AA_deployed = this.battery_in_action;
    //     playerState.x = newPLayer.getX();
    //     playerState.y = newPLayer.getY();
    //     playerState.money = Math.floor(newPLayer.money);
    //     return playerState;
    // };
    // newPLayer.getState = getState;
    // game.World.add(game.engine.world, newPLayer.physical);
    // newPLayer.physical.collisionFilter.group = -1;
    // // return newPLayer;

    return new PlayerEntity(x, y, player, game);
};