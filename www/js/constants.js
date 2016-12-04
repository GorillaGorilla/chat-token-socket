/**
 * Created by frederickmacgregor on 20/09/2016.
 */
angular.module('starter')

  .constant('AUTH_EVENTS', {
    notAuthenticated: 'auth-not-authenticated'
  })

  .constant('API_ENDPOINT', {
    url: 'http://localhost:6017'
    //  For a simulator use: url: 'http://127.0.0.1:8080/api'
  });
