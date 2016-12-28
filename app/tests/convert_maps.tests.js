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
describe('testing the conversion from LatLng into metres',function(){

    it('should be able to convert from latlng to metres and back and get the same value at the end', function(){
        var test = JSON.parse(JSON.stringify(p1));
        proj.mapsToMetres(test);
        expect(test).not.to.equal(p1);
        proj.metresToMaps(test);
        expect(test).to.roughly.deep.equal(p1);
    });

    it('should correctly calculate the distance between p1 and p2 as abot 72 km',function(){
        var test1 = JSON.parse(JSON.stringify(p1));
        var test2 = JSON.parse(JSON.stringify(p2));
        proj.mapsToMetres(test1);
        proj.mapsToMetres(test2);
        var diff = proj.distanceBetweenMetres(test1, test2);
        console.log('diff: ', diff);
    });



});


