'use strict';

/**
 * @ngdoc function
 * @name pipelinrApp.controller:PipelineCtrl
 * @description
 * # PipelineCtrl
 * Controller of the pipelinrApp
 */
angular.module('pipelinrApp')
.controller('PipelineCtrl', ['$scope', '$http', '$routeParams', 'Socket', 'PipelineService', 'DataProcessing', 'Session', '$modal', function($scope, $http, $routeParams, Socket, PipelineService, DataProcessing, Session, $modal) {

	// Set for refresh
	$http.defaults.headers.common['token'] = Session.token;

	// Processes
	$scope.processes = [];

	// Get and resolve pipeline
	$scope.rendered = false;
	var pipeline = PipelineService.get({id: $routeParams.id, tool: []});
	// Resolve new pipeline
	pipeline.$promise.then(function(pipeline) {
		console.log(pipeline);	  	          	

		// Dashboard directive
		$scope.pipeline = pipeline;

		// Modal
	  $scope.openModal = function (kind, size) {
	    var modalInstance = $modal.open({
	      templateUrl: 'views/modals/' + kind + 'Modal.html',
	      controller: kind + 'ModalCtrl',
	      size: size,
	      resolve: {
	        pipeline: function () {
	          return pipeline;
	        }
	      }
	    });
	    modalInstance.result.then(function (process) {
	      $scope.processes.push(process);
	    }, function () { console.log('Modal dismissed at: ' + new Date()); });
	  };

	  $scope.clearProcesses = function() {
	  	var uncheckedCleared = false;
			for(var i = $scope.processes.length; i--; ) {
				console.log($scope.processes[i]);
				if($scope.processes[i].select === false) {
					$scope.processes.splice(i, 1);
					uncheckedCleared = true;
				}
			}
			if(!uncheckedCleared) {
				$scope.processes = [];
			}
	  };

		// Request new pipeline with processes
		$scope.getPipeline = function() {
			$scope.rendered = false;

			var tools = [];
			var datasetsToRegister = null;
			for(var i = 0; i < $scope.processes.length; i++) {
				if($scope.processes[i].select) {
					tools.push($scope.processes[i].tool);
					if($scope.processes[i].tool.task === 'selectDatasets') {
						datasetsToRegister = $scope.processes[i].tool.keys;
					}
				}
			}

			// Remove old listeners and init new listeners for selected datasets
			if(datasetsToRegister !== null) {
				console.log("Re-register new listeners");
				Socket.getSocket().removeAllListeners();
				angular.forEach($scope.pipeline.datasets, function(dataset, key) {
					for(var i = 0; i < datasetsToRegister.length; i++) {
						if(datasetsToRegister[i].name === dataset.key && datasetsToRegister[i].checked) {
							Socket.on('add_value_' + dataset._id, function (v_data) {
								$scope.date = v_data;
						 	});
						}
					}
				});
			}

			console.log(tools);
			var pipeline = PipelineService.get({id: $routeParams.id, tool: tools});
			pipeline.$promise.then(function(newPipeline) {
				$scope.pipeline = newPipeline;
	  	});
		}
		
		// Push notification for each value on each dataset
		angular.forEach($scope.pipeline.datasets, function(dataset, key) {
			Socket.on('add_value_' + dataset._id, function (v_data) {
				$scope.date = v_data;
		 	});
		});
  });

	// Destroy on navigate away
  $scope.$on('$destroy', function (event) {
      Socket.getSocket().removeAllListeners();
  });

}]);
