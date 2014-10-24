'use strict';

/**
 * @ngdoc function
 * @name pipelinrApp.controller:RegisterCtrl
 * @description
 * # RegisterCtrl
 * Controller of the pipelinrApp
 */
angular.module('pipelinrApp')
  .controller('RegisterCtrl', ['$scope', '$http', '$window', 'growl', 'Session', 'UserService', function($scope, $http, $window, growl, Session, UserService) {
	  $scope.addUser = function(){
	  	var user = {name:$scope.newUser.username, email:$scope.newUser.email, password:$scope.newUser.password1};
	    UserService.create(user, function(data) {
		    $scope.newUser.username = '';
		    $scope.newUser.email = '';
		    $scope.newUser.password1 = '';
		    $scope.newUser.password2 = '';

		    growl.success(data.statusText);
		  }, function(error) {
		    growl.error(error.data.statusText);
			});
		};

		console.log($window.sessionStorage);
		console.log(Session);
}]);
