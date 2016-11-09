/**
 * Created by GB115151 on 03/08/2016.
 */
angular.module('game').controller('GameController', ['$scope', 'Socket',
    function($scope, Socket) {
    var lat = 50.5 + Math.random()*2 - 1,
        lng = 0.12 + Math.random()*2 -1,
        username = "mr_man" + Math.random();
        $scope.start = "not yet";
        $scope.score = 0;
        $scope.gameId = '';
        $scope.messages = [];
        $scope.$on('$destroy', function() {
            Socket.removeListener('gameState');
            Socket.removeListener('chatMessage');
        });

        $scope.locationEvent = function(id){
            console.log('location');
            Socket.emit('location', {gameId: id, location: {userId : $scope.userId, x : lat, y: lng}});
        };

        Socket.on('onconnected',function(response){
            console.log(response);
            $scope.gameId = response.gameId;
            $scope.userId = response.userId;
            $scope.locationEvent(response.gameId);
            console.log('game', $scope.gameId);
        });
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


        $scope.sendBomber = function(){
            var obj = { gameId: $scope.gameId,
                input:{userId: $scope.userId,
                    action: 'SEND_BOMBER',
                target: {x: 40, y: 10}}};
            Socket.emit('gameInputMessage',obj);
        };


        Socket.on('new message', function(response){
            $scope.messages.push(response);
            if ($scope.start === "not yet"){
                $scope.start = response.message;
            }

        });

        Socket.on('gameState', function(state){
            $scope.score = state.message;
        });

        Socket.emit('add user', username);

    }
]);