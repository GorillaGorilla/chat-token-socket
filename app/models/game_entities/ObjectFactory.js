/**
 * Created by frederickmacgregor on 08/01/2017.
 */
"use strict";

var Explosion = require('./Explosion');

exports.createExplosion = function(x, y, radius, owner){
    return new Explosion(x, y, radius, owner);
};