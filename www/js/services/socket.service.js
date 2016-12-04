/**
 * Created by frederickmacgregor on 26/11/2016.
 */
angular.module('login').service('Socket', ['$location', '$timeout', 'AuthService',
  function($location, $timeout, AuthService) {
    var self = this;
    var connected = false;
    this.startConnection = function(callback){
    if (AuthService.getUser()) {
      console.log('socket.service: is authenticated', AuthService.getUser());
       self.socket = io.connect('http://localhost:6017');
      self.socket.on('connect', function (msg) {
        console.log("connected", AuthService.getUser());
        self.socket.emit('authenticate', {token: '', name: AuthService.getUser()}); // send the jwt
      });

      self.socket.on('authenticated', function (response) {
          //Do
          console.log('authenticated received');
          connected = true;
        // socket.emit()
          // UserGameIds.setGameId(response.gameId);
          // UserGameIds.setUserId(response.userId);
          // set state to go to map/game screen
          // $state.go('game');
          // $scope.locationEvent(response.gameId);
          // console.log('game', response.gameId);
        if (callback){
          callback(null, response);
        }


          // $('#login').hide();
          // $('#chat').show();
          // $('form').submit(function (event) {
          //   socket.emit('chat message', $('#m').val());
          //   $('#m').val('');
          //   return false;
          // });
        })
        .on('unauthorized', function(msg){
          console.log("unauthorized: " + msg);
          // throw new Error(msg.data.type);
        })
        .on('disconnect',function(msg){
          connected = false;
          console.log('disconnect',msg);
        });
    } else {
        $location.path('/');
    }
      // self.socket = io.connect('http://socket-token.mybluemix.net');
    };
    // this.socket = null;




    // alert(this.socket);

    this.on = function(eventName, callback) {
      if (this.socket) {
        this.socket.on(eventName, function(data) {
          $timeout(function() {
            callback(data);
          });
        });
      }
    };
    this.emit = function(eventName, data) {
      if (this.socket) {
        this.socket.emit(eventName, data);
      }
    };
    this.removeListener = function(eventName) {
      if (this.socket) {
        this.socket.removeListener(eventName);
      }
    };

    this.startConnection();
  }
]);
