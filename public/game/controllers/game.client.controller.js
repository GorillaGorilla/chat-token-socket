/**
 * Created by GB115151 on 03/08/2016.
 */
angular.module('game').controller('GameController', ['$scope', 'Socket',
    function($scope, Socket) {
        $scope.score = 0;
        $scope.gameId = '';
        $scope.messages = [];
        $scope.$on('$destroy', function() {
            Socket.removeListener('gameState');
            Socket.removeListener('chatMessage');
        });
        Socket.on('onconnected',function(response){
            console.log(response);
            $scope.gameId = response.gameId;
        });
        $scope.left = function(){
            Socket.emit('gameInputMessage', {gameId: $scope.gameId, x : -1, y:0});
        };
        $scope.right = function(){
            Socket.emit('gameInputMessage', {gameId: $scope.gameId, x : 1, y:0});
        };
        $scope.up = function(){
            Socket.emit('gameInputMessage', {gameId: $scope.gameId, x : 0, y:1});
        };
        $scope.down = function(){
            Socket.emit('gameInputMessage', {gameId: $scope.gameId, x : 0, y:-1});
        };
        Socket.on('gameState', function(state){
            $scope.score = state;
        });
        Socket.on('chatMessage', function(msg){
           $scope.messages.push(msg);
        });


    }
]);