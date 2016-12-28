/**
 * Created by frederickmacgregor on 27/12/2016.
 */
var Matter = require('matter-js'),
    Body = Matter.Body,
    Vector = Matter.Vector;


var Routines = {
    goTo : function(x, y, entity){
        console.log('goTo called');
        console.log('update bomber to point towards target');
        return function(){
            console.log('goTo ', x , y);
            var self = entity;
            var destination = Vector.create(x, y);
            console.log('destination', destination);

            var posToTarget = Vector.sub(destination, self.physical.position);
            console.log('posToTarget:', posToTarget);
            var distanceSq = Vector.magnitudeSquared(posToTarget) || 0.0001;
            // console.log('distanceSq', distanceSq);
            var normal = Vector.normalise(posToTarget);
            console.log('normal', normal);
            Body.setVelocity(self.physical, Vector.mult(normal, this.speed));
        }
    },
    idle : function(){
        return function(){
            // do nothing};
        }
    }
};

module.exports = Routines;