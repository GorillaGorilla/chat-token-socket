/**
 * Created by frederickmacgregor on 03/10/2016.
 */
"use strict";
var Survey = require('mongoose').model('Survey'),
    passport = require('passport');

exports.create = function(req, res, next){
    // console.log("user", req.body);
    var surveyLog = new Survey({hospitalVisitPrevented : req.body.hospitalVisit,
        policeVisitPrevented : req.body.policeVisit,
        helpful : req.body.helpful,
        responder : req.user.id});

    surveyLog.save(function(err){
        if (err) {
            console.log("mongo save err", err);
            return res.json({success: false, msg: 'Survay data not saved'});
        }
        res.json({success: true, msg: 'Successful saved survey'});
    });
};


exports.list = function(req, res, next){
    Survey.find({}, function(err, data){
        if (err){
            return res.send("error")
        }else{
            res.send(data);
        }
    })
};