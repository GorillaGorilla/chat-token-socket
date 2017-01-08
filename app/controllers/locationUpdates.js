/**
 * Created by frederickmacgregor on 08/01/2017.
 */
"use strict";

var GameServer = require('./game_server.server');

exports.updatePlayerLocation = function(req, res, next){
    console.log('location update received', req.body);

    GameServer.playerLocationUpdate(req.body);

    res.send('success');
};