/**
 * Created by frederickmacgregor on 03/10/2016.
 */
"use strict";
var Attack = require('mongoose').model('Attack'),
    passport = require('passport');

exports.create = function(req, res, next){

};


exports.list = function(req, res, next){
    Attack.find({}, function(err, data){
        if (err){
            return res.send("error")
        }else{
            req.data = data;
            next();
        }
    })
};

exports.filterByGame = function(req, res, next){
    var filtered = req.data.filter(function(el){
        return el.game === req.gameId;
    });

    req.data = filtered;

    next();

};

exports.returnList = function(req, res){

    res.json(req.data);

}


exports.gameId = function(req, res, next, id){
    req.gameId = id;

    next();

};