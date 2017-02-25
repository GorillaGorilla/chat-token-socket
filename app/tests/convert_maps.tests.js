/**
 * Created by frederickmacgregor on 30/11/2016.
 */
var proj = require('../controllers/convert_maps'),
    chai = require('chai'),
    expect = chai.expect;
chai.use(require('chai-roughly'));
var Proj4js = require('proj4');
var p1 = new Proj4js.Point(0.9714904421783491,51.652979688089886);   //any object will do as long as it has 'x' and 'y' properties
var p2 = new Proj4js.Point(-0.05660050000006563,51.538356199999996);

// x should be lng, y should be lat (this is the opposite to how I orriginally had it

var points = [
    {x: 51.53195, y: 0.00372337109, name: "Abbey Road"},
    {y: 13.735268, x: 100.618478, name: "Thailand"},
    {x: 13.735268, y: -85, name: "Test2"},
    {x: -15.664559, y: 29.491951, name: "Zambia"},
    {x: 51.52719174, y: -0.05539211162, name: "Bethnal Green"}
];

var pointsConverted = [];
console.log('points', points);
points.forEach(function(point){
    proj.mapsToMetres(point);
});

console.log('pointsConverted', points);

describe('testing the conversion from LatLng into metres',function(){

    it('x value should not be the same after conversion', function(){
        var test = JSON.parse(JSON.stringify(p1));
        // console.log('test.x', test.x);
        // console.log('p1.x', p1.x);
        proj.mapsToMetres(test);
        expect(test.x).not.to.equal(p1.x);
        expect(test.x).not.to.roughly.equal(p1.x/10);
        expect(test.x).not.to.roughly.equal(p1.x*10);
        // console.log('test.x', test.x);
        // console.log('p1.x', p1.x);
        proj.metresToMaps(test);
        // console.log('test', Object.keys(test));
        // console.log('p1', Object.keys(p1));
        expect(test.x).to.roughly.equal(p1.x);
        expect(test.y).to.roughly.equal(p1.y);
        expect(test.z).to.roughly.equal(p1.z);
    });

    it('should be able to convert from latlng to metres and back and get the same value at the end', function(){
        var test = JSON.parse(JSON.stringify(p1));
        proj.mapsToMetres(test);
        expect(test).not.to.equal(p1);
        proj.metresToMaps(test);
        // console.log('test', Object.keys(test));
        // console.log('p1', Object.keys(p1));
        expect(test.x).to.roughly.equal(p1.x);
        expect(test.y).to.roughly.equal(p1.y);
        expect(test.z).to.roughly.equal(p1.z);
    });

    // it('should correctly calculate the distance between p1 and p2 as abot 72 km',function(){
    //     var test1 = JSON.parse(JSON.stringify(p1));
    //     var test2 = JSON.parse(JSON.stringify(p2));
    //     proj.mapsToMetres(test1);
    //     proj.mapsToMetres(test2);
    //     var diff = proj.distanceBetweenMetres(test1, test2);
    //     console.log('diff: ', diff);
    // });



});


