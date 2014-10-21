'use strict';

/**
 * @ngdoc function
 * @name pipelinrApp.controller:BrowsemodalCtrl
 * @description
 * # BrowsemodalCtrl
 * Controller of the pipelinrApp
 */
angular.module('pipelinrApp')
	.controller('BrowseModalCtrl', ['$scope', '$modalInstance', '$routeParams', 'pipeline', 'DataProcessing', 'Socket', 'PipelineService', function ($scope, $modalInstance, $routeParams, pipeline, DataProcessing, Socket, PipelineService) {
		console.log(pipeline);
		$scope.pipeline = pipeline;

		// Checkboxes
		$scope.keyCheckModel = DataProcessing.getDatasetKeys(pipeline);

	  $scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };

	  // Get Pipeline with tools
	  $scope.sendProcess = function() {
			var process = {select: true, name: 'Browse Datasets', tool: {keys: $scope.keyCheckModel, task: "selectDatasets"} };
			$modalInstance.close(process);
	  }
	}]);
