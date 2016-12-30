"use strict";

var config = require('./config'),
    mongoose = require('mongoose');
module.exports = function() {
    var db = mongoose.connect(config.db);
    require('../app/models/db_models/responder.server.model.js');
    require('../app/models/db_models/Attack.model.js');
    return db;
};