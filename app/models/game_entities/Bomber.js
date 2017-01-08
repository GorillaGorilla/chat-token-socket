/**
 * Created by frederickmacgregor on 23/11/2016.
 */
"use strict";
var Bomber = require('./bomber.class.js');

exports.newBomber = function(playerEntity, game){

    return new Bomber(playerEntity, game);
};