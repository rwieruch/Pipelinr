'use strict';

/**
 * @ngdoc overview
 * @name pipelinrApp
 * @description
 * # pipelinrApp
 *
 * Main module of the application.
 */
angular
  .module('pipelinrApp', [
    'ngRoute',
    'ui.bootstrap',
    'btford.socket-io',
    'd3',
    'perfect_scrollbar',
    'ngResource',
    'angular-growl',
    'ngAnimate'
  ])
  .config(['$routeProvider', '$httpProvider', 'growlProvider', function($routeProvider, $httpProvider, growlProvider) {
    
    // Request interceptor
    $httpProvider.interceptors.push('TokenInterceptor');

    // Growl notification configuration
    growlProvider.globalTimeToLive(5000);
    growlProvider.onlyUniqueMessages(false);
    growlProvider.globalDisableIcons(true);
    growlProvider.globalPosition('bottom-right');
    
    $routeProvider
      .when('/register', {
        templateUrl: 'views/register.html',
        controller: 'RegisterCtrl'
      })
      .when('/pipelines', {
        templateUrl: 'views/pipelines.html',
        controller: 'PipelinesCtrl',
        access: { isFree: true }
      })
      .when('/pipelines/:id', {
        templateUrl: 'views/pipeline.html',
        controller: 'PipelineCtrl',
        access: { isFree: true }
      })
      .otherwise({
        redirectTo: '/register'
      });
  }])
  // Redirection for no session.
  .run( function($rootScope, $location, $templateCache, Session, Socket) {
    // Register listener to watch route changes
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
      if (!Session.isLogged) {
        $location.path('/register');
      }      
    });
  });
