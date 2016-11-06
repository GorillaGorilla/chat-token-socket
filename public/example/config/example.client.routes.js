/**
 * Created by Frederick on 27/03/2016.
 */
angular.module('example').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: 'example/views/example.client.view.html'
        }).
        otherwise({
            redirectTo: '/'
        });
    }
]);