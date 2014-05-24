'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('PipelinesCtrl', ['$scope', '$http', 'Socket', 'PipelineService', 'Session', function($scope, $http, Socket, PipelineService, Session) {
    // Set for refresh
	$http.defaults.headers.common['token'] = Session.token;

	// Set data
	var pipelines = PipelineService.query();
    $scope.pipelines = pipelines;

    // Push notifications
	Socket.on('connectionStatus', function (msg) {
		console.log(msg);
   	});

    Socket.on('newPipeline', function (pipeline) {
    	console.log("newPipeline by socket");
		pipelines.push(pipeline);
		$scope.pipelines = pipelines;
    });

	Socket.on('newDataset', function (pipeline) {
		console.log("newDataset by socket");
		for(var i in pipelines) {
			if(pipelines[i]._id == pipeline._id) {
				pipelines[i].datasets = pipeline.datasets;
			}
		}
		$scope.pipelines = pipelines;
   	});

	// Destroy on naviagte away
    $scope.$on('$destroy', function (event) {
        Socket.getSocket().removeAllListeners();
    });

    $scope.data = [
      {name: "Greg", score: 20},
      {name: "Ari", score: 16},
      {name: 'Q', score: 75},
      {name: "Loser", score: 48}
    ];

	console.log(PipelineService.query());
  }])  
 .controller('PipelineDetailCtrl', ['$scope', '$http', '$routeParams', 'Socket', 'PipelineService', 'Session', function($scope, $http, $routeParams, Socket, PipelineService, Session) {
	//$scope.originId = $routeParams.originId;
	console.log(PipelineService.get({originId: $routeParams.originId}));

	// Set for refresh
	$http.defaults.headers.common['token'] = Session.token; 

	$scope.pipeline = PipelineService.get({originId: $routeParams.originId});
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
		SessionOutService.create(function(data){
		  Session.isLogged = false;
		  Session.token = "";
		  $cookieStore.remove("token");

		  console.log(Session);

		  $location.path( '/register' );

  		  $http.defaults.headers.common['token'] = "";
		});
	};
}]);