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
    if($window.sessionStorage.token && $window.sessionStorage.user)
      isLogged = true;
    else
      isLogged = false;

    var session = {
      isLogged: isLogged,
      token: $window.sessionStorage.token,
      user: $window.sessionStorage.user
    };
    return session;
  });
