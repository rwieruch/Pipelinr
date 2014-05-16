'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', ['ngResource']).
  factory('UserService', function($resource) {
    return $resource(
        //'http://localhost:9000\:9000/register.json',
        'http://localhost:1080/users',
        {},
        //{id: '@id'},                    // default values
        {
            create: {method: 'POST'}//,
            //update: {method: 'PUT'}
        }
    );
   });
