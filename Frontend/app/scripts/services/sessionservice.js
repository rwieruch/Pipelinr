'use strict';

/**
 * @ngdoc service
 * @name pipelinrApp.SessionService
 * @description
 * # SessionService
 * Factory in the pipelinrApp.
 */
angular.module('pipelinrApp')
  .factory('SessionService', function ($resource) {
    return $resource('http://localhost:1080' + '/login', {}, {  
        create: {method: 'POST'}
    });
  });
