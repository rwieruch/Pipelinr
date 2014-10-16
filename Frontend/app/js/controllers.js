'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('PipelinesCtrl', ['$scope', '$http', 'Socket', 'PipelineService', 'DatasetService', 'Session', function($scope, $http, Socket, PipelineService, DatasetService, Session) {

  // Set for page refresh
	$http.defaults.headers.common['token'] = Session.token;

	$scope.alerts = [];
  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  // Search
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

}])  
.controller('PipelineDetailCtrl', ['$scope', '$http', '$routeParams', 'Socket', 'PipelineService', 'DataProcessing', 'Session', '$modal', function($scope, $http, $routeParams, Socket, PipelineService, DataProcessing, Session, $modal) {

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
	      templateUrl: 'partials/modals/' + kind + 'Modal.html',
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
						if(datasetsToRegister[i].name === dataset.key) {
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

}]) 
.controller('QueryModalCtrl', ['$scope', '$modalInstance', '$routeParams', 'pipeline', 'DataProcessing', 'Socket', 'PipelineService', function ($scope, $modalInstance, $routeParams, pipeline, DataProcessing, Socket, PipelineService) {
	console.log(pipeline);
	$scope.pipeline = pipeline;

	// Datepickers
	var allSortedDates = DataProcessing.allSortedDates(pipeline);
	$scope.earliestDate = moment(allSortedDates[0]).format('DD.MM.YYYY, HH:mm');
	$scope.latestDate = moment(allSortedDates[allSortedDates.length-1]).format('DD.MM.YYYY, HH:mm');
	$scope.minDate = moment(allSortedDates[0],'DD.MM.YYYY, HH:mm').format('MM.DD.YYYY');
	var beginInitDate = moment(allSortedDates[0],'DD.MM.YYYY, HH:mm').format('DD.MM.YYYY');
	$scope.maxDate = moment(allSortedDates[allSortedDates.length-1],'DD.MM.YYYY, HH:mm').format('MM.DD.YYYY');
	var endInitDate = moment(allSortedDates[allSortedDates.length-1],'DD.MM.YYYY, HH:mm').format('DD.MM.YYYY');
	$scope.process = { beginDate: beginInitDate, endDate: endInitDate };

  $scope.calendar = {
	    opened: {},
	    dateFormat: 'dd.MM.yyyy',
	    dateOptions: {},
	    open: function($event, which) {
	        $event.preventDefault();
	        $event.stopPropagation();
	        $scope.calendar.opened[which] = true;
	    } 
	};

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  // Get Pipeline with tools
  $scope.sendProcess = function(process) {
		if(typeof process !== 'undefined') {
			var beginDatetime = moment(process.beginDate, 'DD.MM.YYYY').format('DD MM YYYY') + ', ' + moment(process.beginTime).format('HH:mm:ss');
  		var endDatetime = moment(process.endDate, 'DD.MM.YYYY').format('DD MM YYYY') + ', ' + moment(process.endTime).format('HH:mm:ss');
		} else {
			var beginDatetime = '';
			var endDatetime = '';
		}
		
		var process = {select: true, name: 'Query Time', tool: {begin: beginDatetime, end: endDatetime, task: "trimPipeline"} };
		$modalInstance.close(process);
  }
}])
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
}])
.controller('SamplingModalCtrl', ['$scope', '$modalInstance', '$routeParams', 'pipeline', 'DataProcessing', 'Socket', 'PipelineService', function ($scope, $modalInstance, $routeParams, pipeline, DataProcessing, Socket, PipelineService) {
	console.log(pipeline);
	$scope.pipeline = pipeline;

	// Sampling
  $scope.samplingMethods = [{name: 'Random', value: 'randomSampling'}, {name: 'Interval', value: 'intervalSampling'}, {name: 'Frequency', value: 'frequencySampling'}];
  $scope.selSamplingMethod = {value: 'randomSampling'};

	// Popover
	$scope.dynamicTooltip = 'Random: Percentage X of values sampled out.' +
													'Interval: Every X value is not being sampled out.' + 
													'Frequency: In every X seconds goes one average value.'

	// Slider for sampling rate
  $scope.sliderConfig = {min: 0, max: 99, step: 1};
  $scope.rate = 0;

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  // Get Pipeline with tools
  $scope.sendProcess = function(rate) {
		var process = {select: true, name: 'Sampling', tool: {task: $scope.selSamplingMethod.value, perm: false, rate: rate} };
		$modalInstance.close(process);
  }
}])
.controller('RegisterCtrl', ['$scope', '$http', 'UserService', function($scope, $http, UserService) {
  $scope.addUser = function(){
  	var user = {name:$scope.newUser.username, email:$scope.newUser.email, password:$scope.newUser.password1};
    UserService.create(user);

    $scope.newUser.username = '';
    $scope.newUser.email = '';
    $scope.newUser.password1 = '';
    $scope.newUser.password2 = '';
	};
}])
.controller('SessionCtrl', ['$scope', '$http', '$location', '$cookieStore', 'SessionInService', 'SessionOutService', 'Session', function($scope, $http, $location, $cookieStore, SessionInService, SessionOutService, Session) {
	$scope.Session = Session;

	$scope.loginUser = function(){
		var session = {email:$scope.user.email, password:$scope.user.password};
	    console.log(session);
		$http.defaults.useXDomain = true;
		delete $http.defaults.headers.common['X-Requested-With'];
	    SessionInService.create(session, function(data){

			console.log(data);

			console.log(data.token);
			Session.isLogged = true;
			Session.token = data.token;

			$cookieStore.put("token", data.token);

			console.log(Session);

		  $scope.user.email = '';
			$scope.user.password = '';

			$location.path( '/pipeline-list' );

			$http.defaults.headers.common['token'] = Session.token;
		});
	};
	$scope.logoutUser = function(){
		SessionOutService.create(function(data) {});
	  Session.isLogged = false;
	  Session.token = "";
	  $cookieStore.remove("token");

	  console.log(Session);

	  $location.path( '/register' );

		$http.defaults.headers.common['token'] = "";
	};
}]);