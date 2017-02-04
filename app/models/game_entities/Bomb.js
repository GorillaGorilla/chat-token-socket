/**
 * Created by frederickmacgregor on 23/11/2016.
 */
var Matter = require('matter-js'),
    Engine = Matter.Engine,
    Bodies = Matter.Bodies,
    Vector = Matter.Vector,
    Body =  Matter.Body,
    Map = require('./category_filter_masks');

exports.newBomb = function(x, y, parentAsset){
    var bomb = {
    };
    bomb.physical = Bodies.circle(x, y, 1,{mass: 0});
    bomb.state = 'live';
    bomb.fuse = 0.001;
    bomb.owner = parentAsset.owner;
    bomb.droppedBy = parentAsset.id;
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
    parentAsset.game.World.add(game.engine.world, this.physical);
    bomb.physical.collisionFilter.group = 0;
    bomb.physical.collisionFilter.category = Map.BOMB;
    // single pipe is bitwise ADD
    bomb.physical.collisionFilter.mask = Map.MOBILE_AA &  Map.PLAYER ;

    return bomb;


};