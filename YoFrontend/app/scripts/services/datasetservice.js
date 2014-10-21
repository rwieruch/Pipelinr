'use strict';

/**
 * @ngdoc service
 * @name pipelinrApp.DatasetService
 * @description
 * # DatasetService
 * Factory in the pipelinrApp.
 */
angular.module('pipelinrApp')
  .factory('DatasetService', function ($resource) {
  return $resource('http://localhost:1080' + '/pipelines/:pipeline_id/datasets/:dataset_id', {pipeline_id: '@pipeline_id', dataset_id: '@dataset_id'}, {  
      remove: { method: 'DELETE' }
  });
});
