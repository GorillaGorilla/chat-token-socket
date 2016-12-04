/**
 * Created by frederickmacgregor on 26/11/2016.
 */
angular.module('login').service('Location',function($cordovaGeolocation){
  var lastLocation = null;

  var options = {timeout: 10000, enableHighAccuracy: true};

  var getPosition = function(){
    $cordovaGeolocation.getCurrentPosition(options).then(function(position){

      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        alert('location gotten  ' + latLng.lat() + ' ' + latLng.lng());
      lastLocation = latLng
    }, function(error){
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
      return lastLocation.lat();
    }
    console.log('no location');

  };

  var getY = function(){
    if(lastLocation){
      return lastLocation.lng();
    }
    console.log('no location');
  };
  getPosition();
  // setInterval()     //use this to update position? or set listener for change in position....

  return {
    currentLocation: currentLocation,
    getX : getX,
    getY : getY,
      getPosition : getPosition
  }
});
