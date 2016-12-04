/**
 * Created by frederickmacgregor on 14/10/2016.
 */
angular.module('core', []);


angular.
module('core').
filter('decript', function() {
  return function(input, char) {
    if (input && char) {
      // alert('decript input: ' + input);
      // alert('decript char: ' + char);
      var decryptData = CryptoJS.AES.decrypt(input, char).toString(CryptoJS.enc.Utf8);
      // alert('decripted: ' + decryptData);
      return decryptData
    } else {
      return input;
    }
  };
});

angular.
module('core')
  .directive('groupedRadio', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
        model: '=ngModel',
        value: '=groupedRadio'
      },
      link: function(scope, element, attrs, ngModelCtrl) {
        element.addClass('button');
        element.on('click', function(e) {
          scope.$apply(function() {
            ngModelCtrl.$setViewValue(scope.value);
          });
        });

        scope.$watch('model', function(newVal) {
          element.removeClass('button-positive');
          if (newVal === scope.value) {
            element.addClass('button-positive');
          }
        });
      }
    };
  })
