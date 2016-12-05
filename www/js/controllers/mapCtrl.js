/**
 * Created by frederickmacgregor on 26/11/2016.
 */



angular.module('map').controller('MapCtrl', function($scope, $state, $cordovaGeolocation, Socket, Location, UserGameIds) {
  console.log('loading map module');
  var options = {timeout: 10000, enableHighAccuracy: true},
    markers = [],
      targetFinder = null,
    latLng = Location.currentLocation(),
    playerState,
    icons = {
        player: "img/player_icon.png",
        enemy: "img/colonel2.png",
        BOMBER: "img/plane.png",
        AA_TANK: "img/AA_TANK.png",
        FLAK: "img/FLAK.png"
    };
    var locationEvent = function(){
        console.log('location', Location.getX(), Location.getY());
        Socket.emit('location', {gameId: UserGameIds.getGameId(), location: {username : UserGameIds.getUsername(), x : Location.getX(), y: Location.getY()}});
    };
    $scope.UI_STATE = 'VIEW';  //view, send_bomber, send_AA

  $scope.state = "";
  $scope.playerHealth = 100;
  var mapOptions = {
    center: latLng,
    zoom: 15,
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
        target: {x: targetLatLng.lat(), y: targetLatLng.lng()}}};
    Socket.emit('gameInputMessage',obj);
  };

    $scope.sendAABattery = function(){
        console.log("send Battery");
        var targetLatLng = $scope.map.getCenter();
        var obj = { gameId: UserGameIds.getGameId(),
            input:{username: UserGameIds.getUsername(),
                action: 'SEND_BATTERY',
                destination: {x: targetLatLng.lat(), y: targetLatLng.lng()}}};
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
          var assetLatLng = new google.maps.LatLng(asset.x, asset.y);
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

  function renderPlayer(player){
    // console.log('render player');
    var tempLatLng = new google.maps.LatLng(player.x, player.y);
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

  function addAsset(location, type){
    var image = icons[type];
    addMarker(location, image);
  }

  function deleteMarkers(){
    setMapOnAll(null);
    markers = [];
  }



  $scope.leaveGame = function(){
    Socket.emit('leave game');
    Socket.removeListener('gameState');
    AuthService.logout();
  };

});
