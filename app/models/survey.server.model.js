/**
 * Created by frederickmacgregor on 03/10/2016.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SurveySchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    hospitalVisitPrevented:  Boolean,
    policeVisitPrevented:  Boolean,
    helpful:  Boolean,
    responder: { type : Schema.ObjectId, ref: 'Responder' }
});

mongoose.model('Survey', SurveySchema);