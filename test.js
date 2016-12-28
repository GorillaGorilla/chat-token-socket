/**
 * Created by frederickmacgregor on 07/11/2016.
 */
var proj = require('./app/controllers/convert_maps'),
Matter = require('matter-js'),
    UUID = require('node-uuid'),
    Engine = Matter.Engine,
    Bodies = Matter.Bodies,
    Vector = Matter.Vector,
    Body =  Matter.Body,
    Proj4js = require('proj4'),
    chai = require('chai'),
    expect = chai.should();

proj.test();


var p1 = new Proj4js.Point(50.823947, -2.127909);   //any object will do as long as it has 'x' and 'y' properties
var p2 = new Proj4js.Point(50.795795,-2.073550);
console.log('p1 before', p1);

proj.mapsToMetres(p1);
proj.mapsToMetres(p2);

console.log('distance between',proj.distanceBetweenMetres(p1,p2));


class Polygon {
    constructor(height, width) {
        this.height = height;
        this.width = width;
    }

    get area() {
        return this.calcArea();
    }

    calcArea() {
        return this.height * this.width;
    }
}

const square = new Polygon(10, 10);

console.log(square.area);


class Animal {
    constructor(name) {
        this.name = name;
    }

    speak() {
        console.log(this.name + ' makes a noise.');
    }
}

class Dog extends Animal {
    speak() {
        console.log(this.name + ' barks.');
    }
}

class Cat {
    constructor(name) {
        this.name = name;
    }

    speak() {
        console.log(this.name + ' makes a noise.');
    }
}

class Lion extends Cat {
    speak() {
        super.speak();
        console.log(this.name + ' roars.');
    }
}

var l = new Lion('Bernard');

l.speak();

class GameObject {
    constructor(x, y) {
        this.physical = Bodies.circle(x, y, 5);
        this.id = UUID();
        this.running = true;
        this.speed= 0.3;
        this.damage = 40;
        this.health= 50;
        this.line_of_sight = 50;
    }
    getX(){
    return this.physical.position.x;
    }
    getY(){
    return this.physical.position.y;
    }
    setPosition(x, y){
    Matter.Body.setPosition(this.physical, {x: x, y: y});
    }
    getPosition() {
    return this.physical.position;
    }

    checkCollisionObj (gameObj, distance){
        //    return true or false
        var distanceVector = Vector.sub(this.getPosition(), gameObj.getPosition());
        console.log('distanceVector checkCOllision method', distanceVector);
        var distanceSq = Vector.magnitudeSquared(distanceVector) || 0.0001;
        console.log('distanceVector distanceSq checkCollision method', distanceSq);
        return distanceSq < (distance*distance)

    }

    checkCollisionPoint (vector, distance){
        //    return true or false
        var distanceVector = Vector.sub(this.getPosition(), vector);
        console.log('distanceVector checkCOllision method', distanceVector);
        var distanceSq = Vector.magnitudeSquared(distanceVector) || 0.0001;
        console.log('distanceVector distanceSq checkCollision method', distanceSq);
        return distanceSq < (distance*distance)

    }

    createClone(){
        var clone = {};
        for( var att in this){
            if(att !== 'physical'){
                clone[att] = this[att];
            }
        }
        clone.x = this.getX();
        clone.y = this.getY();

        return clone;
    }
}

class PlayerAsset extends GameObject {
    constructor(owner, game){
        super(owner.getX(), owner.getY());
        this.owner = owner;
        this.game = game;
        this.range = 50;
        this.accuracy= 30;
        this.target = null;
        this.state = 'attack';
        this.routine = null;
    }

    update(dt){
        console.log('update');
    }

    atTarget(){
        var self = this;
        if (((this.getX() - self.target.x)*(this.getX() - self.target.x) < 10 )
            &&  ((this.getY() - self.target.y)*(this.getY() - self.target.y) < 10 )){
            return true;
        }else {
            console.log('-------------------- false ');
            return false;
        }
    }
    atBase(){
    var self = this;
        if (((self.getX() - self.owner.getX())*(self.getX() - self.owner.getX()) < 10 )
            &&  ((self.getY() - self.owner.getY())*(self.getY() - self.owner.getY()) < 10 )){
            return true;
        }else {
            console.log('-------------------- false ');
            return false;
    }
    }
    setRoutine(routine){
        var self = this;
        self.routine = routine;
    }

    getOwner(){
        return this.owner;
    }

}

class Bomber extends PlayerAsset {

    setTarget(x, y){
        var self = this;
        this.target = Vector.create(x, y);
        // console.log('this.target', this.target);

        var posToTarget = Vector.sub(this.target, this.physical.position);
        // console.log('posToTarget:', posToTarget);
        var distanceSq = Vector.magnitudeSquared(posToTarget) || 0.0001;
        // console.log('distanceSq', distanceSq);
        var normal = Vector.normalise(posToTarget);
        // console.log('normal', normal);
        Body.setVelocity(this.physical, Vector.mult(normal, this.speed));

        self.setRoutine(Routines.goTo(x, y, self));
    }

    update(dt){
        var self = this;
        if (self.health <= 0){
            self.owner.bomber_in_action --;
            return self.running = false;
        }
        self.routine(dt);

        if (this.state ==='attack' && self.target && self.atTarget()){
            console.log('---------------------------------------- at target');
            self.dropBomb();
            //    setTarget = null;
            //    return home
            self.target = null;
            self.setRoutine(self.goTo(self.owner.getX(), self.owner.getY(), self));
            self.state = 'return';
            self.addTarget(self.owner.getX(),self.owner.getY());

        }else if(this.state === 'return' && self.atTarget()){
            // changed so that tests against target rather than base, so it can still succeed if player moves.
            self.owner.returnBomber(self);
            self.running = false;
            // game.World.engine
        }
        // this.lastDt = dt;
        // this.lastPos.x = this.getX();
        // this.lastPos.y = this.getY();
    }


}

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



var d = new Dog('Mitzie');
d.speak();
var a = new Animal('Cuthbert');

a.speak();

var fakeOwner = new GameObject(5,10);

var obj = new Bomber(fakeOwner, 'game');

var cloneObj = obj.createClone();

console.log('get owner',obj.getOwner());

console.log('get position', obj.getPosition());

console.log('clone', cloneObj);

console.log('atBase',obj.atBase());

var fakeOwner,
    bomber,
    mobileAA,
    obj,
    x = 20,
    y = 15;


describe('Testing Bomberclass', function() {
    beforeEach(function () {
        fakeOwner = new GameObject(x, y);
        bomber = new Bomber(fakeOwner, 'game');
        obj = new GameObject(20, 20);
    });
    it('should return the correct owner', function () {
        bomber.getOwner().should.equal(fakeOwner);
    });
    it('should be create in position x and y', function () {
        bomber.getX().should.equal(x);
        bomber.getY().should.equal(y);
    });
    it('atBase function should return true on initialisation', function () {
        bomber.atBase().should.equal(true);
    });

    it('should have a createClone method that makes a copy without physical',function(){
        var clone = bomber.createClone();

        clone.should.have.property('x');
        clone.should.have.property('y');
        clone.should.not.have.property('physical');
        clone.x.should.equal(x);
        clone.y.should.equal(y);

    });

    it('checkCollisionObj function should return true', function () {
        bomber.checkCollisionObj(obj, 5.1).should.equal(true);
    });
    it('checkCollisionPoint function should return false if false', function () {
        bomber.checkCollisionObj(obj, 1).should.equal(false);
    });

    it('should be able to set a goTo routine', function(){
        bomber.setRoutine(Routines.goTo(20,30,bomber));

        bomber.update(1);

        bomber.physical.velocity.x.should.equal(0);
        bomber.physical.velocity.y.should.equal(0.3);

        console.log(bomber.physical.velocity);
    });

});