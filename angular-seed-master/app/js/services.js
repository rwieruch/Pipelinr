'use strict';

/* Services */

var pipelinrURL = "http://localhost:1080";

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', ['ngResource']).
  factory('UserService', function($resource) {
    return $resource(pipelinrURL + '/users', {}, {	
        	query: {method: 'GET', isArray: true},
            create: {method: 'POST'}
    });
  })
  .factory('UserFactory', function ($resource) {
    return $resource(pipelinrURL + '/users/:id', {}, {
        show: { method: 'GET', params: {id: '@id'} },
        update: { method: 'PUT', params: {id: '@id'} },
        delete: { method: 'DELETE', params: {id: '@id'} }
    })
});
