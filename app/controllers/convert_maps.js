/**
 * Created by frederickmacgregor on 07/11/2016.
 */
var Proj4js = require('proj4');

var source = new Proj4js.Proj('EPSG:4326');    //source coordinates will be in Longitude/Latitude, WGS84
var dest = new Proj4js.Proj('EPSG:3785');     //destination coordinates in meters, global spherical mercators projection, see http://spatialreference.org/ref/epsg/3785/


exports.mapsToMetres = function(objWithxy){
    Proj4js.transform(source, dest, objWithxy);
    objWithxy.x = objWithxy.x/1000;
    objWithxy.y = objWithxy.y/1000;
};

exports.metresToMaps = function(objWithxy){
    objWithxy.x = objWithxy.x*1000;
    objWithxy.y = objWithxy.y*1000;
    Proj4js.transform(dest, source, objWithxy);
};

exports.test = function(){

    // transforming point coordinates
    var p = new Proj4js.Point(-76.0,45.0);   //any object will do as long as it has 'x' and 'y' properties
    console.log('p before', p);
    Proj4js.transform(source, dest, p);      //do the transformation.  x and y are modified in place
    console.log('p after', p);
    Proj4js.transform(dest, source, p);
    console.log('and back: ', p)

};