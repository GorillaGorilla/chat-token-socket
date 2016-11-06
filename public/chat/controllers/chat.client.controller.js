/**
 * Created by GB115151 on 22/07/2016.
 */
angular.module('chat').controller('ChatController', ['$scope',
    'Socket',
    function($scope, Socket) {
        $scope.messages = [];
        Socket.on('chatMessage', function(message) {
            $scope.messages.push(message);
        });
        $scope.sendMessage = function() {
            var message = {
                text: this.messageText,
            };
            Socket.emit('chatMessage', message);
            this.messageText = '';
        }
        $scope.$on('$destroy', function() {
            Socket.removeListener('chatMessage');
        })
    }
]);