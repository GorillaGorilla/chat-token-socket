/**
 * Created by Frederick on 26/03/2016.
 */
var mainApplicationModuleName = 'palanalyst';

var mainApplicationModule = angular.module(mainApplicationModuleName, ['ngResource',
    'ngRoute','example','chat','game']);

mainApplicationModule.config(['$locationProvider',
function($locationProvider){
    $locationProvider.hashPrefix('!');
}
]);

if (window.location.hash === '#_=_') window.location.hash = '#!';

angular.element(document).ready(function() {
    angular.bootstrap(document, [mainApplicationModuleName]);
});