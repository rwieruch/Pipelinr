'use strict';

/**
 * @ngdoc service
 * @name pipelinrApp.UserService
 * @description
 * # UserService
 * Factory in the pipelinrApp.
 */
angular.module('pipelinrApp')
  .factory('UserService', function ($resource) {
    return $resource('http://localhost:1080' + '/users', {}, {  
        query: {method: 'GET', isArray: true},
        create: {method: 'POST'}
    });
  });
