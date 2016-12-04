// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','ngCordova','login' ,'map', 'core'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    // if (window.cordova.plugins.diagnostic){
    //   // cordova.ready event to check cordova has loaded before we try to use cordova
    //   cordova.plugins.diagnostic.isLocationAuthorized(function(authorized){
    //     console.log("Location is " + (authorized ? "authorized" : "unauthorized"));
    //     if (!authorized){
    //       cordova.plugins.diagnostic.requestLocationAuthorization(function(status){
    //         switch(status){
    //           case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
    //             console.log("Permission not requested");
    //             break;
    //           case cordova.plugins.diagnostic.permissionStatus.GRANTED:
    //             console.log("Permission granted");
    //             break;
    //           case cordova.plugins.diagnostic.permissionStatus.DENIED:
    //             alert("Permission denied");
    //             break;
    //           case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
    //             alert("Permission permanently denied");
    //             break;
    //         }
    //       }, function(error){
    //         alert(error);
    //       });
    //
    //
    //     }
    //
    //
    //   }, function(error){
    //     console.error("The following error occurred: "+error);
    //   });
    // }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

  .config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('game', {
        url: '/game',
        templateUrl: 'templates/map.html',
        controller: 'MapCtrl'
      })
      .state('login',{
        url: '/',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })
      .state('outside', {
        url: '/outside',
        abstract: true,
        templateUrl: 'templates/outside.html'
      })
      .state('outside.login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })
      .state('outside.register', {
        url: '/register',
        templateUrl: 'templates/register.html',
        controller: 'RegisterCtrl'
      });


    $urlRouterProvider.otherwise("/");

  })
  .run(function($rootScope, $state, AuthService, AUTH_EVENTS) {
    $rootScope.$on('$stateChangeStart', function(event, next, nextParams, fromState) {
      if (!AuthService.isAuthenticated()) {
        console.log(next.name);
        if (next.name !== 'outside.login' && next.name !== 'outside.register') {
          event.preventDefault();
          $state.go('outside.login');
        }
      }
    });
  });
