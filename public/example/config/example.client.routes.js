/**
 * Created by Frederick on 27/03/2016.
 */
angular.module('example').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: 'game/views/game.client.view.html'
        }).
        otherwise({
            redirectTo: '/'
        });
    }
]);