'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('MyCtrl1', ['$scope', function($scope) {

  }])
  .controller('MyCtrl2', ['$scope', function($scope) {

  }])  
  .controller('RegisterCtrl', ['$scope', '$http', 'UserService', function($scope, $http, UserService) {
    $scope.addUser = function(){
    	var user = {name:$scope.newUser.username, email:$scope.newUser.email, password:$scope.newUser.password1};
	    user = UserService.create(user);
	    console.log(user);

	    //var bla = UserService.query();

	    $scope.newUser.username = '';
	    $scope.newUser.email = '';
	    $scope.newUser.password1 = '';
	    $scope.newUser.password2 = '';
	};
  }])
  // Mêta Session for app.
  .controller('SessionCtrl', ['$scope', 'Session', function($scope, Session) {
	$scope.Session = Session;
  }])
  .controller('LoginLogoutCtrl', ['$scope', '$http', '$location', 'SessionInService', 'SessionOutService', 'Session', function($scope, $http, $location, SessionInService, SessionOutService, Session) {
	$scope.loginUser = function(){
		var session = {email:$scope.user.email, password:$scope.user.password};
	    console.log(session);
		$http.defaults.useXDomain = true;
		delete $http.defaults.headers.common['X-Requested-With'];
	    SessionInService.create(session, function(data){

			console.log(data);

			// succefull login
			/*console.log(data.token);
			Session.isLogged = true;
			Session.token = data.token;

			console.log(Session);

		  	$scope.user.email = '';
			$scope.user.password = '';*/

			// Redirect after login
			//$location.path( '/showreels.html' );
		});
	};
	/*$scope.logoutUser = function(){
		$http.defaults.headers.common['token'] = Session.token;

		SessionOutService.create(function(data){
		  Session.isLogged = false;
		  Session.token = "";

		  console.log(Session);

		  $location.path( '/signup.html' );
		});
	};*/
}]);