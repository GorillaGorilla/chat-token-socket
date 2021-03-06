/**
 * Created by frederickmacgregor on 12/12/2016.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


// different types: when bomb is damages player, when flak is fired, when flak hits?

// when bomber is downed

var AttackSchema = new Schema({
    game: String,
    occurred: {
        type: Date,
        default: Date.now
    },
    type:  String,
    owner: String,
    asset: String,
    target: String,
    x: Number,
    y: Number
});

var EventSchema = new Schema({
    game: String,
    occurred: {
        type: Date,
        default: Date.now
    },
    type:  String,
    owner: String,
    target: String,
    x: Number,
    y: Number
});


mongoose.model('Attack', AttackSchema);