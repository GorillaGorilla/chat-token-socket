/**
 * Created by frederickmacgregor on 26/11/2016.
 */
angular.module('login').service('Location',function($cordovaGeolocation, Projection){
  var lastLocation = null;
  var positionQueued = false;

  var options = {timeout: 10000, enableHighAccuracy: true};

  var getPosition = function(callback){
    $cordovaGeolocation.getCurrentPosition(options).then(function(position){

      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        // alert('location gotten  ' + latLng.lat() + ' ' + latLng.lng());
      lastLocation = latLng;
      if(callback){
          callback(null, lastLocation);
      }

    }, function(error){
        var latLng = new google.maps.LatLng(50.5 + Math.random()*2 - 1, 0.12 + Math.random()*2 -1);

        // alert('location gotten  ' + latLng.lat() + ' ' + latLng.lng());
        lastLocation = latLng;
        if(callback){
            callback(null, lastLocation);
        }
      console.log("Could not get location");
    });
  };




  var currentLocation = function(){
    if (lastLocation){
      return lastLocation
    }else{
      return false;
    }
  };

  var getX = function(){
    if (lastLocation){
      return lastLocation.lng();
    }
    console.log('no location');

  };

  var getY = function(){
    if(lastLocation){
      return lastLocation.lat();
    }
    console.log('no location');
  };
  getPosition();
  // setInterval()     //use this to update position? or set listener for change in position....
  //   setInterval(getPosition, 60000);
  return {
    currentLocation: currentLocation,
    getX : getX,
    getY : getY,
      getPosition : getPosition
  }
});
