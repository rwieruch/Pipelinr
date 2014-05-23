'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
  'ui.bootstrap',
  'ngCookies',
  'btford.socket-io',
  'd3'
]).
config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
  $routeProvider.when('/pipeline-list', {templateUrl: 'partials/pipeline-list.html', controller: 'PipelinesCtrl', access: { isFree: true } });
  $routeProvider.when('/pipeline-list/:originId', {templateUrl: 'partials/pipeline-detail.html', controller: 'PipelineDetailCtrl', access: { isFree: true } });
  $routeProvider.when('/register', {templateUrl: 'partials/register.html', controller: 'RegisterCtrl'});
  $routeProvider.otherwise({redirectTo: '/register'});
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
}])  
// Redirection for no session.
.run( function($rootScope, $location, Session, Socket) {
  // register listener to watch route changes
  $rootScope.$on( "$routeChangeStart", function(event, next, current) {
    if (!Session.isLogged) {
      $location.path( "/register" );
    }      
  });
});
