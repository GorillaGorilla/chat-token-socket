/**
 * Created by GB115151 on 22/07/2016.
 */
angular.module('chat').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/chat', {
            templateUrl: 'chat/views/chat.client.view.html'
        });
    }
]);