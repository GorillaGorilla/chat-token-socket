/**
 * Created by frederickmacgregor on 26/11/2016.
 */
angular.module('login').controller('LoginCtrl',function($scope, $state, $cordovaGeolocation, Socket, UserGameIds, Location, AuthService){

  $scope.user = {name: ""};
  AuthService.destroy();
  $scope.login = function(){
    console.log("login", $scope.username);
    if (Location.currentLocation()){
      AuthService.login($scope.user).then(function(msg) {
        console.log("logged in?");
        UserGameIds.setUsername($scope.user.name);
        Socket.startConnection(function(err){
          if (err){
            return console.log(err);
          }
          Socket.on('game connected',function(response){
              UserGameIds.setGameId(response.gameId);
              // set state to go to map/game screen
              $state.go('game');
              // $scope.locationEvent(response.gameId);
              console.log('game', response.gameId);
            $state.go('game');
          });
          Socket.on('waiting for game', function(data){
            $state.go('waiting');
          });
          Socket.emit('add user', {token: AuthService.getToken(), name: UserGameIds.getUsername()});



        });
        // Socket.on('connect', function (msg) {
        //   console.log("connected", AuthService.getToken());
        //   socket.emit('authenticate', {token: AuthService.getToken()}); // send the jwt
        // })
        //   .on('authenticated', function () {
        //     //Do
        //     console.log(response);
        //     connected = true;
        //     UserGameIds.setGameId(response.gameId);
        //     UserGameIds.setUserId(response.userId);
        //     // set state to go to map/game screen
        //     $state.go('game');
        //     // $scope.locationEvent(response.gameId);
        //     console.log('game', response.gameId);
        //
        //
        //     // $('#login').hide();
        //     // $('#chat').show();
        //     // $('form').submit(function (event) {
        //     //   socket.emit('chat message', $('#m').val());
        //     //   $('#m').val('');
        //     //   return false;
        //     // });
        //   })
        //   .on('unauthorized', function(msg){
        //     console.log("unauthorized: " + JSON.stringify(msg.data));
        //     throw new Error(msg.data.type);
        //   });
      }, function(errMsg) {
        console.log("err", errMsg);
        // var alertPopup = $ionicPopup.alert({
        //   title: 'Login failed!',
        //   template: errMsg
        // });
        alert('login failed ' + errMsg);
      });


    }else{
      return alert('Waiting for current location.');
    }




  };

  // Socket.on('onconnected',function(response){
  //   console.log(response);
  //   connected = true;
  //   UserGameIds.setGameId(response.gameId);
  //   UserGameIds.setUserId(response.userId);
  //   // set state to go to map/game screen
  //   $state.go('game');
  //   // $scope.locationEvent(response.gameId);
  //   console.log('game', response.gameId);
  // });




});
