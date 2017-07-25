/**
 * Created by frederickmacgregor on 20/09/2016.
 */
angular.module('starter')

  .constant('AUTH_EVENTS', {
    notAuthenticated: 'auth-not-authenticated'
  })

  .constant('API_ENDPOINT', {
    // url: 'http://178.62.119.155:6001' // digital ocean
      // url: 'https://socket-token.mybluemix.net'
      // url: 'http://localhost:6017' // local
      url: 'http://localhost:3000' //docker
  });
