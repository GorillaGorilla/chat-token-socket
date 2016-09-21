var config = require('./config'),
    mongoose = require('mongoose');
module.exports = function() {
    console.log("connection");
    var db = mongoose.connect(config.db);
    require('../app/models/user.server.model');
    return db;
};