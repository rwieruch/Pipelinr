'use strict';

/**
 * @ngdoc function
 * @name pipelinrApp.controller:SessionCtrl
 * @description
 * # SessionCtrl
 * Controller of the pipelinrApp
 */
angular.module('pipelinrApp')
  .controller('SessionCtrl', ['$scope', '$http', '$location', '$window', 'SessionService', 'Session', function($scope, $http, $location, $window, SessionService, Session) {
	$scope.Session = Session;
	console.log($scope.Session);

	$scope.loginUser = function(){
		var session = {email:$scope.user.email, password:$scope.user.password};
    SessionService.create(session, function(data){

			Session.isLogged = true;
			Session.token = data.token;
			Session.username = data.user.username;
			Session.email = data.user.email;

			$window.sessionStorage.token = data.token;
			$window.sessionStorage.username = data.user.username;
			$window.sessionStorage.email = data.user.email;

		  $scope.user.email = '';
			$scope.user.password = '';

			$location.path( '/pipelines' );

			console.log($window.sessionStorage);
			console.log(Session);
		});
	};
	$scope.logoutUser = function(){
	  Session.isLogged = false;
	  delete Session.token;
	  delete Session.username;
	  delete Session.email;

	  delete $window.sessionStorage.token;
	  delete $window.sessionStorage.username;
	  delete $window.sessionStorage.email;
	};
}]);
