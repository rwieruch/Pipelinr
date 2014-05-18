'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
  'ui.bootstrap'
]).
config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
  $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1', access: { isFree: true } });
  $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
  $routeProvider.when('/register', {templateUrl: 'partials/register.html', controller: 'RegisterCtrl'});
  $routeProvider.otherwise({redirectTo: '/register'});
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
}])  
// Redirection for no session.
.run( function($rootScope, $location, Session) {
  // register listener to watch route changes
  $rootScope.$on( "$routeChangeStart", function(event, next, current) {
    if (!Session.isLogged) {
      $location.path( "/register" );
    }      
  });
});
