/**
 * Created by Frederick on 23/03/2016.
 */
var User = require('mongoose').model('User'),
    passport = require('passport');



exports.read = function(req, res){
    console.log("read called", req.record);
    res.json(req.record);
};


exports.recordByID = function (req, res, next, id) {
    console.log("recordById: ", id);
    //req.targetedUser contains the current;ly logged in user, req.body contains the request contents (also a user).
    //this function finds the user by the url id and replaced req.targetedUser with this. req.body doesn't change.
    //console.log("userByID: " + id);
    //console.log("userById req.body before: " + JSON.stringify(req.body));
    //console.log("userBy Id req.targetedUser " + req.targetedUser);
    User.findOne({regNumber: id}, function(err,user){
        if (err) {
            console.log("err", err);
            return res.send(err);
        }else {
            req.record = user;
            next();
        }
    });
};

var getErrorMessage = function(err) {
    var message = '';
    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = 'Username or registration number already exists';
                break;
            default:
                message = 'Something went wrong';
        }
    } else {
        for (var errName in err.errors) {
            if (err.errors[errName].message) message = err.errors[errName].
                message;
        }
    }
    return message;
};



