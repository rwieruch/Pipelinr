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
    SessionInService.create(session, function(data){

			Session.isLogged = true;
			Session.token = data.token;

			$cookieStore.put("token", data.token);

		  $scope.user.email = '';
			$scope.user.password = '';
			$location.path( '/pipelines' );
		});
	};
	$scope.logoutUser = function(){
		SessionOutService.create(function(data) {});
	  Session.isLogged = false;
	  Session.token = "";
	  $cookieStore.remove("token");
	};
}]);
