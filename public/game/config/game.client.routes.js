/**
 * Created by GB115151 on 03/08/2016.
 */
angular.module('game').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'game/views/game.client.view.html'
        })
    }
]);