'use strict';

/**
 * @ngdoc service
 * @name pipelinrApp.PipelineService
 * @description
 * # PipelineService
 * Factory in the pipelinrApp.
 */
angular.module('pipelinrApp')
  .factory('PipelineService', function ($resource) {
  return $resource('http://localhost:1080' + '/api/v1/pipelines/:id', {}, {  
      query: {method: 'GET', isArray: true},
      get: {method:'GET', params:{id:'id', tool: ''}},
      remove: { method: 'DELETE', params: {id:'id'} }
  });
});
