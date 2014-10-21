'use strict';

/**
 * @ngdoc service
 * @name pipelinrApp.Session
 * @description
 * # Session
 * Factory in the pipelinrApp.
 */
angular.module('pipelinrApp')
  .factory('Session', function ($cookieStore) {
    var isLogged;
    if(!(typeof $cookieStore.get("token") === "undefined"))
      isLogged = true;
    else
      isLogged = false;

    var session = {
      isLogged: isLogged,
      token: $cookieStore.get("token")
    };
    return session;
  });
