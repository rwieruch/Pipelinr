'use strict';

/**
 * @ngdoc service
 * @name pipelinrApp.SessionOutService
 * @description
 * # SessionOutService
 * Factory in the pipelinrApp.
 */
angular.module('pipelinrApp')
  .factory('SessionOutService', function ($resource) {
    return $resource('http://localhost:1080' + '/logout', {}, {  
        create: {method: 'POST'}
    });
  });
