'use strict';

/**
 * @ngdoc function
 * @name pipelinrApp.controller:PipelinesCtrl
 * @description
 * # PipelinesCtrl
 * Controller of the pipelinrApp
 */
angular.module('pipelinrApp')
  .controller('PipelinesCtrl', ['$scope', '$http', 'Socket', 'PipelineService', 'DatasetService', function($scope, $http, Socket, PipelineService, DatasetService) {

	$scope.alerts = [];
  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  $scope.search = function(item) {
  	if (item.name.indexOf($scope.query)!=-1 || angular.isUndefined($scope.query)) {           
      return true;
    }
    return false;
	};

	// Get pipelines
	var pipelines = PipelineService.query();
	pipelines.$promise.then(function(pipelines) {

	  $scope.pipelines = pipelines;
	  console.log(pipelines);

		$scope.deletePipeline = function (pipeline) {
	    PipelineService.remove({ id: pipeline._id }, function (response) {
				var index = $scope.pipelines.indexOf(pipeline);
		    if (index != -1) {
	        $scope.pipelines.splice(index, 1);
    			$scope.alerts.push({ type: 'success', msg: 'Pipeline deleted successfully.'});
    		}
	    }, function (error) {
	      $scope.alerts.push({ type: 'danger', msg: error.status + ": " + error.data});
	    });
	  };

		$scope.deleteDataset = function (pipeline, dataset) {
	    DatasetService.remove({ pipeline_id: dataset._pipeline, dataset_id: dataset._id }, function (response) {
				var pipe_index = $scope.pipelines.indexOf(pipeline);
		    if (pipe_index != -1) {
	        var data_index = $scope.pipelines[pipe_index].datasets.indexOf(dataset);
	        if (data_index != -1) {
						$scope.pipelines[pipe_index].datasets.splice(data_index, 1);
			    	$scope.alerts.push({ type: 'success', msg: 'Dataset deleted successfully.'});
	        }
	      }
	    }, function (error) {
	      $scope.alerts.push({ type: 'danger', msg: error.status + ": " + error.data});
	    });
	  };

    // Push notifications
		Socket.on('add_pipeline', function (p_data) {
			$scope.alerts.push({ type: 'info', msg: 'Pipeline "' + p_data.pipeline.name + '" added.'});
			p_data.pipeline.state = "new";
			$scope.pipelines.push(p_data.pipeline);	
			addDatasetSocket(p_data.pipeline);
	 	});

  	angular.forEach($scope.pipelines, function(pipeline, key) {
  		addDatasetSocket(pipeline);
			angular.forEach(pipeline.datasets, function(dataset, key) {
				addValueSocket(dataset);
			});
		});

		// Push notification for each dataset on each pipeline
		function addDatasetSocket(pipeline) {
			Socket.on('add_dataset_' + pipeline._id, function (d_data) { // same as (A)
				$scope.alerts.push({ type: 'info', msg: 'Dataset "' + d_data.dataset.key + '" in Pipeline "' + pipeline.name + '" added.'});
				d_data.dataset.state = "new";
				pipeline.datasets.push(d_data.dataset);

				addValueSocket(d_data.dataset);
			});
		}

		// Push notification for each value on each dataset
		function addValueSocket(dataset) {
			Socket.on('add_value_' + dataset._id, function (v_data) { // same as (B)
				if(typeof dataset.count == "undefined")
					dataset.count = 1;
				else
					dataset.count++;
		 	});
		}

	});

	// Destroy on navigate away
  $scope.$on('$destroy', function (event) {
    Socket.getSocket().removeAllListeners();
  });

}]);  
