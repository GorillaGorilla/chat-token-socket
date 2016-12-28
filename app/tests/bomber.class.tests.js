/**
 * Created by frederickmacgregor on 27/12/2016.
 */
var Matter = require('matter-js'),
    UUID = require('node-uuid'),
    Engine = Matter.Engine,
    Bodies = Matter.Bodies,
    Vector = Matter.Vector,
    Body =  Matter.Body,
    // Proj4js = require('proj4'),
    chai = require('chai'),
    expect = chai.should(),
    Bomber = require('../models/bomber.class'),
    GameObject = require('../models/gameobject.class'),
    Routines = require('../models/routines'),
    Game = require('../models/Game'),
    game = Game.create(UUID(),require('../../mockSocketHandler'),require('../../mock.dbhandler'));



var World = Matter.World,
    PlayerFactory = require('../models/PlayerEntity');

var fakeOwner,
    bomber,
    mobileAA,
    obj,
    x = 20,
    y = 15,
    fakePlayer = {id: UUID(), username: 'fake'};


describe('Testing Bomberclass', function() {
    beforeEach(function () {
        fakeOwner = PlayerFactory.newPlayer(x, y, fakePlayer, game);
        // console.log('fakeOwner.createClone', fakeOwner.createClone());
        bomber = new Bomber(fakeOwner, game);
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
        console.log('clone', clone);
        clone.should.have.property('x');
        clone.should.have.property('y');
        clone.should.have.property('type');
        clone.should.not.have.property('physical');
        clone.x.should.equal(x);
        clone.y.should.equal(y);
        clone.type.should.equal('BOMBER');

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

    it('call drop bomb', function () {
        game.bombs.should.have.length(0);
        bomber.dropBomb();
        game.bombs.should.have.length(1);
    });

    it('should be able to set a target', function () {
        bomber.setTarget(30, 15);
        bomber.update(1);
        console.log('bomber.getX', bomber.getX());
        bomber.physical.velocity.x.should.equal(0.3);
        bomber.physical.velocity.y.should.equal(0);

    });


});