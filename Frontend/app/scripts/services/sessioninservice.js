'use strict';

/**
 * @ngdoc service
 * @name pipelinrApp.SessionInService
 * @description
 * # SessionInService
 * Factory in the pipelinrApp.
 */
angular.module('pipelinrApp')
  .factory('SessionInService', function ($resource) {
    return $resource('http://localhost:1080' + '/login', {}, {  
        create: {method: 'POST'}
    });
  });
