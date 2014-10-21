'use strict';

/**
 * @ngdoc function
 * @name pipelinrApp.controller:SessionCtrl
 * @description
 * # SessionCtrl
 * Controller of the pipelinrApp
 */
angular.module('pipelinrApp')
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
