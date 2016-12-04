/**
 * Created by frederickmacgregor on 02/12/2016.
 */
angular.module('starter')
  .service('AuthService', function($q, $http, API_ENDPOINT) {
    var LOCAL_TOKEN_KEY = 'yourTokenKey';
    var isAuthenticated = false;
    var authToken;
    var savedUser;

    var getUser = function(){
      if(isAuthenticated){
        return savedUser;
      }
    };

    var getToken = function(){
      return authToken;
    }

    function loadUserCredentials() {
      var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
      if (token) {
        useCredentials(token);
      }
    }

    function storeUserCredentials(token) {
      window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
      useCredentials(token);
    }

    function useCredentials(token) {
      isAuthenticated = true;
      authToken = token;

      // Set the token as header for your requests!
      $http.defaults.headers.common.Authorization = authToken;
    }

    function destroyUserCredentials() {
      authToken = undefined;
      isAuthenticated = false;
      $http.defaults.headers.common.Authorization = undefined;
      window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    }

    var register = function(user) {
      return $q(function(resolve, reject) {
        console.log("register called");
        console.log(JSON.stringify(user));
        $http({
          method: 'POST',
          url: API_ENDPOINT.url + '/api/signup',
          data: user
        }).then(function(result) {
          console.log("callback");
          if (result.data.success) {
            resolve(result.data.msg);
          } else {
            reject(result.data.msg);
          }
        }, function(err) {
          reject(err);
          // console.log("err",JSON.stringify(err));
          // alert(err);
        });
      });
    };

    var login = function(user) {
      return $q(function(resolve, reject) {
        console.log("login called");
        console.log(JSON.stringify(user));
        $http({
          method: 'POST',
          url: API_ENDPOINT.url + '/api/authenticate',
          data: user
        }).then(function(result) {
          console.log("Login callback");
          if (result.data.success) {
            storeUserCredentials(result.data.token);
            // alert(JSON.stringify(result.data.user));

            // storing attributes for retrieval later
            savedUser = result.data.name;
            resolve(result.data.msg);
          } else {
            reject(result.data.msg);
          }
        }, function(err) {
          console.log("Login err", JSON.stringify(err));
          reject(err);
          // alert(err);
        });
      });
    };

    /*
     var login = function(user) {
     console.log("User is: "+JSON.stringify(user));
     return $q(function(resolve, reject) {
     //console.log("api endpoint", API_ENDPOINT.url, user.name);
     $http.post('http://token-auth-template.mybluemix.net' + '/api/authenticate', user).then(function(result) {
     console.log("Result is: "+result);
     if (result.data.success) {
     storeUserCredentials(result.data.token);
     resolve(result.data.msg);
     } else {
     reject(result.data.msg);
     }
     }, function(err){
     console.log("err",JSON.stringify(err));
     });
     });
     };
     */


    var logout = function() {
      destroyUserCredentials();
    };

    loadUserCredentials();

    return {
      login: login,
      register: register,
      logout: logout,
      isAuthenticated: function() {
        return isAuthenticated;
      },
      getToken : getToken,
      getUser : getUser,
      destroy : destroyUserCredentials
    };
  })


  .factory('AuthInterceptor', function($rootScope, $q, AUTH_EVENTS) {
    return {
      responseError: function(response) {
        $rootScope.$broadcast({
          401: AUTH_EVENTS.notAuthenticated,
        }[response.status], response);
        return $q.reject(response);
      }
    };
  })

  .config(function($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
  });
