/**
 * Created by frederickmacgregor on 07/11/2016.
 */
var Proj4js = require('proj4');

var source = new Proj4js.Proj('EPSG:4326');    //source coordinates will be in Longitude/Latitude, WGS84
var dest = new Proj4js.Proj('EPSG:3785');     //destination coordinates in meters, global spherical mercators projection, see http://spatialreference.org/ref/epsg/3785/
var factor = 10;

exports.mapsToMetres = function(objWithxy){
    // wont accept y value greater than 90... could be to do with projection described in above link.
    Proj4js.transform(source, dest, objWithxy);
    objWithxy.x = objWithxy.x/factor ;
    objWithxy.y = objWithxy.y/factor;
};

exports.metresToMaps = function(objWithxy){
    objWithxy.x = objWithxy.x*factor;
    objWithxy.y = objWithxy.y*factor;
    Proj4js.transform(dest, source, objWithxy);
};

exports.distanceBetweenMetres = function(p1, p2){
    console.log('p1', p1);
    console.log('p2', p2);
    var difference = {x : p2.x - p1.x, y : p2.y - p1.y};
    console.log('diff d=vector',difference);
    var hyp = Math.sqrt(difference.x*difference.x + difference.y*difference.y);
    return hyp;
};

exports.test = function(){

    // transforming point coordinates
    var p1 = new Proj4js.Point(51.652979688089886,0.9714904421783491);   //any object will do as long as it has 'x' and 'y' properties
    var p2 = new Proj4js.Point(51.538356199999996,-0.05660050000006563);
    console.log('p1 before', p1);
    Proj4js.transform(source, dest, p1);      //do the transformation.  x and y are modified in place
    console.log('p after', p1);
    Proj4js.transform(dest, source, p1);
    console.log('and back: ', p1);

};


function mercator (longitude, latitude) {
    var radius = 6378137;
    var max = 85.0511287798;
    var radians = Math.PI / 180;
    var point = {};

    point.x = radius * longitude * radians;
    point.y = Math.max(Math.min(max, latitude), -max) * radians;
    point.y = radius * Math.log(Math.tan((Math.PI / 4) + (point.y / 2)));

    return point;
}