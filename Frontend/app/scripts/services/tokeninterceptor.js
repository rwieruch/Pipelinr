'use strict';

/**
 * @ngdoc service
 * @name pipelinrApp.TokenInterceptor
 * @description
 * # TokenInterceptor
 * Factory in the pipelinrApp.
 */
angular.module('pipelinrApp')
.factory('TokenInterceptor', ['$q', '$window', 'Session', function($q, $window, Session) {
  return {
    request: function(config) {
      config.headers = config.headers || {};
      if(Session.isLogged) {
        config.headers['token'] = Session.token;
      }
      return config || $q.when(config);
    },
 
    response: function(response) {
      return response || $q.when(response);
    }
  };
}]);
