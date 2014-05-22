'use strict';

/* Services */

var pipelinrURL = "http://localhost:1080";

angular.module('myApp.services', ['ngResource'])
.factory('Socket', function ($rootScope) {
  var socket = io.connect("http://localhost:1080");

  return {
    emit: function (event, data, callback) {
      socket.emit(event, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(null, args);
          }
        });
      });
    },

    on: function (eventName, callback) {
        socket.on(eventName, function () {
            var args = arguments;
            $rootScope.$apply(function () {
                callback.apply(socket, args);
            });
        });
    },

    off: function (event, callback) {
      socket.removeListener(event, callback);
    },
    getSocket: function() {
      return socket;
    }
  };
})
.factory('PipelineService', function($resource) {
    return $resource(pipelinrURL + '/testcases/:originId', {}, {  
        query: {method: 'GET', isArray: true},
        get: {method:'GET', params:{originId:'originId'}}
    });
  })
.factory('UserService', function($resource) {
    return $resource(pipelinrURL + '/users', {}, {	
    	  query: {method: 'GET', isArray: true},
        create: {method: 'POST'}
    });
  })
  .factory('SessionInService', function($resource) {
    return $resource(pipelinrURL + '/login', {}, {  
        create: {method: 'POST'}
    });
  })  
  .factory('SessionOutService', ['$resource', 'Session', function($resource, Session) {
    var resource = $resource(pipelinrURL + '/logout', {}, {  
        create: {method: 'POST'}
    });

    resource = Session.wrapActions( resource, ["create"] );

    return resource;
  }])
  .factory('Session', function($cookieStore) {
    /*var isLogged;
    if(!(typeof $cookieStore.get("token") === "undefined"))
      isLogged = true;
    else
      isLogged = false;

    var session = {
      isLogged: isLogged,
      token: $cookieStore.get("token")
    };
    return session;*/

    var session = {};

    session.set = function( newToken ) {
      token = newToken;
    };

    session.get = function() {
      return token;
    };

    var isLogged;
    if(!(typeof $cookieStore.get("token") === "undefined"))
      isLogged = true;
    else
      isLogged = false;

    var token = $cookieStore.get("token");

    // wrap given actions of a resource to send auth token with every
    // request
    session.wrapActions = function( resource, actions ) {
      // copy original resource
      var wrappedResource = resource;
      for (var i=0; i < actions.length; i++) {
        tokenWrapper( wrappedResource, actions[i] );
      };
      // return modified copy of resource
      return wrappedResource;
    };

    // wraps resource action to send request with auth token
    var tokenWrapper = function( resource, action ) {
      // copy original action
      resource['_' + action]  = resource[action];
      // create new action wrapping the original and sending token
      resource[action] = function( data, success, error){
        return resource['_' + action](
          angular.extend({}, data || {}, {access_token: session.get()}),
          success,
          error
        );
      };
    };

    return session;
  });

