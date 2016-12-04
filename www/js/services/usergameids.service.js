/**
 * Created by frederickmacgregor on 26/11/2016.
 */
angular.module('login').service('UserGameIds', function(Socket){
  var username = null,
    gameId = null,
    userId = null,
    connected = false;
  var setUsername = function(name){
    alert('setting username  ' +  name);
    username = name;
  };
  var getGameId = function(){
    return gameId;
  };

  var setGameId = function(id){
    gameId = id;
  };
  var getUsername= function(){
    return username
  };
  var isConnected = function(){
    return connected;
  };
  return {
    setUsername: setUsername,
    getGameId: getGameId,
    getUsername: getUsername,
    setGameId: setGameId,
    isConnected: isConnected
  };
});
