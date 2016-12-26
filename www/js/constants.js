/**
 * Created by frederickmacgregor on 20/09/2016.
 */
angular.module('starter')

  .constant('AUTH_EVENTS', {
    notAuthenticated: 'auth-not-authenticated'
  })

  .constant('API_ENDPOINT', {
    url: 'https://socket-token.mybluemix.net'
      // url: 'http://localhost:6017'
  });
