/**
 * Created by frederickmacgregor on 05/12/2016.
 */
exports.newCrater = function(x, y, r, life_time){
    var crater = {
    };
    crater.physical = Bodies.circle(x, y, r),
        crater.state = 'live';
    crater.lifetime = life_time;
    crater.time = life_time;
    crater.blast_radius = r;
    crater.update = function(dt){
        console.log('crater update', crater.fuse, dt, crater.getX(), crater.getY());
        crater.time -= dt;

        if (crater.time < 0){
            crater.state = 'faded';
        }
    };
    crater.getX = function(){return this.physical.position.x};
    crater.getY = function(){return this.physical.position.y};
    crater.getPosition = function(){return this.physical.position};
    crater.type = "CRATER";
    return crater;


};