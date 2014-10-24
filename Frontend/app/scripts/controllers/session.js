'use strict';

/**
 * @ngdoc function
 * @name pipelinrApp.controller:SessionCtrl
 * @description
 * # SessionCtrl
 * Controller of the pipelinrApp
 */
angular.module('pipelinrApp')
  .controller('SessionCtrl', ['$scope', '$http', '$location', '$window', 'SessionInService', 'SessionOutService', 'Session', function($scope, $http, $location, $window, SessionInService, SessionOutService, Session) {
	$scope.Session = Session;

	$scope.loginUser = function(){
		var session = {email:$scope.user.email, password:$scope.user.password};
    SessionInService.create(session, function(data){

			Session.isLogged = true;
			Session.token = data.token;
			Session.user = data.user;

			$window.sessionStorage.token = data.token;
			$window.sessionStorage.user = data.user;

		  $scope.user.email = '';
			$scope.user.password = '';
			$location.path( '/pipelines' );

			console.log($window.sessionStorage);
			console.log(Session);
		});
	};
	$scope.logoutUser = function(){
		SessionOutService.create();
		
	  Session.isLogged = false;
	  delete Session.token;
	  delete Session.user;

	  delete $window.sessionStorage.token;
	  delete $window.sessionStorage.user;
	};
}]);
