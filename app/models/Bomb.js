/**
 * Created by frederickmacgregor on 23/11/2016.
 */
var Matter = require('matter-js'),
    Engine = Matter.Engine,
    Bodies = Matter.Bodies,
    Vector = Matter.Vector,
    Body =  Matter.Body;

exports.newBomb = function(x, y, owner){
    var bomb = {
    };
    bomb.physical = Bodies.rectangle(x, y, 1, 1),
    bomb.state = 'live';
    bomb.fuse = 0.001;
    bomb.owner = owner;
    bomb.damage = 34;
    bomb.blast_radius = 50;
    bomb.update = function(dt){
        console.log('bomb update', bomb.fuse, dt, bomb.getX(), bomb.getY());
        bomb.fuse -= dt*10;

        if (bomb.fuse < 0){
            bomb.state = 'detonate';
        }
    };
    bomb.getX = function(){return this.physical.position.x};
    bomb.getY = function(){return this.physical.position.y};
    bomb.getPosition = function(){return this.physical.position};

    return bomb;


};