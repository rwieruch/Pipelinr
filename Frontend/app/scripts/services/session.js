'use strict';

/**
 * @ngdoc service
 * @name pipelinrApp.Session
 * @description
 * # Session
 * Factory in the pipelinrApp.
 */
angular.module('pipelinrApp')
  .factory('Session', function ($window) {
    var isLogged = false;
    if($window.sessionStorage.token && $window.sessionStorage.username && $window.sessionStorage.email)
      isLogged = true;
    else
      isLogged = false;

    var session = {
      isLogged: isLogged,
      token: $window.sessionStorage.token,
      username: $window.sessionStorage.username,
      email: $window.sessionStorage.email
    };
    return session;
  });
