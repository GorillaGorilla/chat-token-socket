/**
 * Created by frederickmacgregor on 26/11/2016.
 */



angular.module('map').controller('MapCtrl', function($scope, $state, $cordovaGeolocation, Socket, Location, UserGameIds) {
  console.log('loading map module');
  var options = {timeout: 10000, enableHighAccuracy: true},
    markers = [],
      controlPoints = [],
    cpMarkers = [],
      targetFinder = null,
    latLng = Location.currentLocation(),
      locationQueued = false,
    playerState,
      locationOveride = false,
    icons = {
        player: "img/player_icon.png",
        enemy: "img/colonel2.png",
        BOMBER: "img/plane.png",
        AA_TANK: "img/AA_TANK.png",
        FLAK: "img/FLAK.png"
    };

    var lat = 50.5 + Math.random()*2 - 1,
        lng = 0.12 + Math.random()*2 -1;
    var locationEvent = function(){
        console.log('location', Location.getX(), Location.getY());
        Socket.emit('location', {gameId: UserGameIds.getGameId(), location: {username : UserGameIds.getUsername(), x : Location.getX(), y: Location.getY()}});
        locationQueued = false;
    };
    $scope.UI_STATE = 'VIEW';  //view, send_bomber, send_AA

  $scope.state = "";
  $scope.playerHealth = 100;
  var mapOptions = {
    center: latLng,
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  if(Location.currentLocation()){
    locationEvent();
  }else{
    Location.getPosition();
  }

  $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

  $scope.sendBomber = function(){
    console.log("send Bomber");
    var targetLatLng = $scope.map.getCenter();
    var obj = { gameId: UserGameIds.getGameId(),
      input:{username: UserGameIds.getUsername(),
        action: 'SEND_BOMBER',
        target: {x: targetLatLng.lng(), y: targetLatLng.lat()}}};
    Socket.emit('gameInputMessage',obj);
  };

    $scope.sendAABattery = function(){
        console.log("send Battery");
        var targetLatLng = $scope.map.getCenter();
        var obj = { gameId: UserGameIds.getGameId(),
            input:{username: UserGameIds.getUsername(),
                action: 'SEND_BATTERY',
                destination: {x: targetLatLng.lng(), y: targetLatLng.lat()}}};
        Socket.emit('gameInputMessage',obj);
    };

  //Wait until the map is loaded
  google.maps.event.addListenerOnce($scope.map, 'idle', function(){
      targetFinder = new google.maps.Circle({
          strokeColor: '#FF0000',
          strokeOpacity: 0.0,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.0,
          map: $scope.map,
          center: $scope.map.getCenter(),
          radius: 50
      });
      locationEvent();  // used to be in 'wait for map idle event..'
  });


    google.maps.event.addListenerOnce($scope.map, 'center_changed', function(){


        targetFinder.setOptions({
          center: $scope.map.getCenter()
        });
    });

    $scope.setBomberTargettingState = function(){
      $scope.UI_STATE = "SEND_BOMBER";
      targetFinder.setOptions({
          strokeOpacity: 0.8,
          fillOpacity: 0.2
      });
    };

    $scope.setBatteryTargettingState = function(){
        $scope.UI_STATE = "SEND_BATTERY";
        targetFinder.setOptions({
            strokeOpacity: 0.8,
            fillOpacity: 0.2
        });
    };
    $scope.setViewState = function(){
        $scope.UI_STATE = "VIEW";
        targetFinder.setOptions({
            strokeOpacity: 0,
            fillOpacity: 0
        });
    };


  Socket.on('gameState', function(state){
    // console.log('game state', state);
    $scope.score = state;
    render(state);
    if(!locationOveride){delayPositionCall();}

  });

  function render(state){
      deleteMarkers();
      state.players.forEach(function(player){
          renderPlayer(player);
          if(player.username === UserGameIds.username){
              $scope.playerHealth = player.health;
              $scope.living = player.state;
          }

      });
      state.assets.forEach(function(asset){
          var assetLatLng = new google.maps.LatLng(asset.y, asset.x);
          if (!asset.type && $scope.map.getZoom() <15){
              return;
          }
          addAsset(assetLatLng, asset.type);
      });
      targetFinder.setOptions({
          center: $scope.map.getCenter()
      });

  }

  function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);

    }
  }

    var cpState = false;


  $scope.map.addListener('zoom_changed', function(){
      console.log('zoom_changed');
      if(cpMarkers.length === 0){
          console.log('emitting request for cp state');
          Socket.emit('control point state');
          return;
      }
      console.log('$scope.map.getZoom()', $scope.map.getZoom(), cpState);
      if ($scope.map.getZoom() >= 15 && cpState === false){
          console.log('setting map true');
          cpMarkers.forEach(function(mark){
              mark.setMap($scope.map);
          });
          cpState = true;
      }else if ($scope.map.getZoom() < 15 && cpState === true){
          console.log('setting map false');
          cpMarkers.forEach(function(mark){
              mark.setMap(null);
          });
          cpState = false;
      }
  });

  Socket.on('control points', function(data){
      console.log('control points event', data);
      controlPoints = data.points;
      controlPoints.forEach((cp)=>{
          var cpLatLng = new google.maps.LatLng(cp.y, cp.x);
          addCP(cpLatLng)
      });
  });

  function renderPlayer(player){
    // console.log('render player');
    var tempLatLng = new google.maps.LatLng(player.y, player.x);
    if (player.username === UserGameIds.getUsername()){

      addMarker(tempLatLng, icons['player']);
    }else{
      addMarker(tempLatLng, icons['enemy'])
    }
  }

  function addMarker(location, icon) {
    //accepts a LatLng obj and a path to the correct icon image
    var opts = {
      position: location,
      map: $scope.map
    };
    if (icon){
      opts.icon = icon;
    }
    var marker = new google.maps.Marker(opts);
    markers.push(marker);
  }

  function addCP(location, icon) {
        //accepts a LatLng obj and a path to the correct icon image
        var opts = {
            position: location,
            map: null
        };
        if (icon){
            opts.icon = icon;
        }
        var marker = new google.maps.Marker(opts);
        cpMarkers.push(marker);
  }


  function addAsset(location, type){
    var image = icons[type];
    addMarker(location, image);
  }

  function deleteMarkers(){
    setMapOnAll(null);
    markers = [];
  }

    var delayPositionCall = function(){
      if(!locationQueued){
          setTimeout(function(){
              Location.getPosition(locationEvent());

          }, 45000);
          locationQueued = true;
      }

    };

    $scope.locationEvent = function(id){
        console.log('location');
        locationOveride = true;
        Socket.emit('location', {gameId: UserGameIds.getGameId(), location: {username : UserGameIds.getUsername(), x : lng, y: lat}});
    };


    $scope.left = function(){
        lat --;
        // Socket.emit('gameInputMessage', {gameId: $scope.gameId, x : -1, y:0});
    };
    $scope.right = function(){
        lat ++;
        // Socket.emit('gameInputMessage', {gameId: $scope.gameId, x : 1, y:0});
    };
    $scope.up = function(){
        lng ++;
        // Socket.emit('gameInputMessage', {gameId: $scope.gameId, x : 0, y:1});
    };
    $scope.down = function(){
        lng --;
        // Socket.emit('gameInputMessage', {gameId: $scope.gameId, x : 0, y:-1});
    };


  $scope.leaveGame = function(){
    Socket.emit('leave game');
    Socket.removeListener('gameState');
    AuthService.logout();
  };

    function showDistance(n){
        "use strict";
        return roundNumber(n/1e3,5)+" km ("+roundNumber(kmToMiles(n/1e3),5)+" miles)"
    }

});
