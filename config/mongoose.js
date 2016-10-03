"use strict";

var config = require('./config'),
    mongoose = require('mongoose');
module.exports = function() {
    var db = mongoose.connect(config.db);
    require('../app/models/responder.server.model.js');
    require('../app/models/user.server.model.js');
    require('../app/models/survey.server.model.js');
    return db;
};