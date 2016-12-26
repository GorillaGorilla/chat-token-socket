/**
 * Created by frederickmacgregor on 22/12/2016.
 */



angular.module('starter').service('Projection',function(){
    var source = new proj4.Proj('EPSG:4326');    //source coordinates will be in Longitude/Latitude, WGS84
    var dest = new proj4.Proj('EPSG:3785');     //destination coordinates in meters, global spherical mercators projection, see http://spatialreference.org/ref/epsg/3785/


    var mapsToMetres = function(objWithxy){
        proj4.transform(source, dest, objWithxy);
        objWithxy.x = objWithxy.x/10;
        objWithxy.y = objWithxy.y/10;
    };

    var metresToMaps = function(objWithxy){
        objWithxy.x = objWithxy.x*10;
        objWithxy.y = objWithxy.y*10;
        proj4.transform(dest, source, objWithxy);
    };

    var distanceBetweenMetres = function(p1, p2){
        console.log('p1', p1);
        console.log('p2', p2);
        var difference = {x : p2.x - p1.x, y : p2.y - p1.y};
        console.log('diff d=vector',difference);
        var hyp = Math.sqrt(difference.x*difference.x + difference.y*difference.y);
        return hyp;
    };


    var test = function(){

        // transforming point coordinates
        var p1 = new proj4.Point(51.652979688089886,0.9714904421783491);   //any object will do as long as it has 'x' and 'y' properties
        var p2 = new proj4.Point(51.538356199999996,-0.05660050000006563);
        console.log('p1 before', p1);
        proj4.transform(source, dest, p1);      //do the transformation.  x and y are modified in place
        console.log('p after', p1);
        proj4.transform(dest, source, p1);
        console.log('and back: ', p1);

    };

    test();

});