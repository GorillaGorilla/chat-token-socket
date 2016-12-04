/**
 * Created by frederickmacgregor on 02/12/2016.
 */
angular.module('starter')
  .controller('RegisterCtrl', function($scope, AuthService, $ionicPopup, $state) {

    $scope.user = {
      name: '',
      password: '',
      service: ''
    };

    // $scope.team = [{
    //   text: "Blue",
    //   value: "blue"
    // }, {
    //   text: "Red",
    //   value: "red"
    // } ];

    $scope.displayUser = function(){
      alert(JSON.stringify($scope.user));
    };


    $scope.signup = function() {
      // if ($scope.user.service){
        AuthService.register($scope.user).then(function(msg) {
          $state.go('outside.login');
          var alertPopup = $ionicPopup.alert({
            title: 'Register success!',
            template: msg
          });
        }, function(errMsg) {
          var alertPopup = $ionicPopup.alert({
            title: 'Register failed!',
            template: errMsg
          });
        });
      // }else {
      //   alert('Please select your service!');
      // }

    };

  });
