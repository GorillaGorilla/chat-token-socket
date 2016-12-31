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
            // console.log('goTo ', x , y);
            var self = entity;''
            var destination = Vector.create(x, y);
            // console.log('destination', destination);

            var posToTarget = Vector.sub(destination, self.physical.position);
            // console.log('posToTarget:', posToTarget);
            var distanceSq = Vector.magnitudeSquared(posToTarget) || 0.0001;
            // console.log('distanceSq', distanceSq);
            var normal = Vector.normalise(posToTarget);
            // console.log('normal', normal);
            Body.setVelocity(self.physical, Vector.mult(normal, this.speed));
        }
    },
    idle : function(){
        return function(){
            // do nothing};
        }
    },

    defend : function(PlayerAsset){
        var self = PlayerAsset;
        return function(){
            //
            // console.log('defend');
            if (self.target && (self.target.health > 0) && self.target.running){
                // console.log('Routines.defend firing');
                // check whether still in range, remove target if not and
                //    if it is in range, create a flak with a high velocity aiming at the target in line with accuracy
                //    call this function off the game, which will have the flakFactory and return so nothing else happens

                var distanceVector = Vector.sub(self.getPosition(), self.target.getPosition());
                // console.log('distanceVector ', distanceVector);
                var distanceSq = Vector.magnitudeSquared(distanceVector) || 0.0001;
                // console.log('distanceVector bomb, playEnt', distanceSq);
                if (distanceSq < self.range*self.range){
                    // console.log('in range!  firing!');
                    if (self.timeToFire <= 0){
                        self.timeToFire = Number(String(self.reloadTime));
                        return self.fire();
                    }

                }
            }else{
                //    no target so first call look for target, scan all bombers to check within range
                // console.log('Routines.defend looking for target');
                self.game.bombers.filter(function(bomber){
                    return bomber.owner !==self.owner;
                })
                    .forEach(function(bomber){
                        var distanceVector = Vector.sub(self.getPosition(), bomber.getPosition());
                        // console.log('distanceVector ', distanceVector);
                        var distanceSq = Vector.magnitudeSquared(distanceVector) || 0.0001;
                        // console.log('distanceVector bomb, playEnt', distanceSq);
                        if (distanceSq < self.line_of_sight*self.line_of_sight){
                            // console.log('found target');
                            self.target = bomber;
                        }
                    })
            }

        };
    }
};

module.exports = Routines;