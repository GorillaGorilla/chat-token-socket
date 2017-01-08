/**
 * Created by frederickmacgregor on 30/12/2016.
 */
"use strict";
var proj = require('../controllers/convert_maps');

module.exports = function(game, nextState){
    // console.log('render called');
    var assets = [];
    game.flaks.forEach(function(flak){
        var flakState = flak.getState();
        // console.log('flakState in renderer', flakState);
        proj.metresToMaps(flakState);
        assets.push(flakState);
    });
    game.AAbatterys.forEach(function(battery){
        var batteryState = battery.createClone();
        proj.metresToMaps(batteryState);
        assets.push(batteryState);
    });
    game.bombers.forEach(function(bomber){
        var bomberState = bomber.createClone();
        proj.metresToMaps(bomberState);
        assets.push(bomberState);
    });
    var playerStates = [];
    game.playerEntities.forEach(function(entity){
        var entityState = entity.createClone();
        entityState.money = Math.floor(entityState.money);
        entityState.score = Math.floor(entityState.score);
        // console.log('entity clone', entityState);
        proj.metresToMaps(entityState);
        playerStates.push(entityState);

    });
    var explosions = [];
    game.explosions.forEach(function(explo){
        var exploState = explo.createClone();
        proj.metresToMaps(exploState);
        explosions.push(exploState);
    });


    game.renderTime = 0;
    nextState.players = playerStates;
    nextState.assets = assets;
    nextState.explosions = explosions;
    // console.log("next state",nextState);
    game.socketHandler.sendGameState(nextState);
    nextState = {};
};