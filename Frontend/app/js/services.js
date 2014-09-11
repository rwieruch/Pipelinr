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
  return $resource(pipelinrURL + '/pipelines/:id', {}, {  
      query: {method: 'GET', isArray: true},
      get: {method:'GET', params:{id:'id', tool: ''}},
      remove: { method: 'DELETE', params: {id:'id'} }
  });
})
.factory('DatasetService', function($resource) {
  return $resource(pipelinrURL + '/pipelines/:pipeline_id/datasets/:dataset_id', {pipeline_id: '@pipeline_id', dataset_id: '@dataset_id'}, {  
      remove: { method: 'DELETE' }
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
  .factory('SessionOutService', function($resource) {
    return $resource(pipelinrURL + '/logout', {}, {  
        create: {method: 'POST'}
    });
  })
  .factory('Session', function($cookieStore) {
    var isLogged;
    if(!(typeof $cookieStore.get("token") === "undefined"))
      isLogged = true;
    else
      isLogged = false;

    var session = {
      isLogged: isLogged,
      token: $cookieStore.get("token")
    };
    return session;
  }).
  factory('DataProcessing', function() {
     
    var factory = {}; 
 
    factory.earliestDate = function(pipeline) {
      var earliestDate = moment().format('DD MM YYYY, HH:mm:ss');
      for(var i = 0; i < pipeline.datasets.length; i++) {
        for(var j = 0; j < pipeline.datasets[i].values.length; j++) {
          if(pipeline.datasets[i].values[j].timestamp < earliestDate) {
            earliestDate = pipeline.datasets[i].values[j].timestamp;
          }
        }
      }
      return earliestDate;
    }
 
    factory.latestDate = function(pipeline) {
      var latestDate = moment().format('DD MM YYYY, HH:mm:ss');
      for(var i = 0; i < pipeline.datasets.length; i++) {
        for(var j = 0; j < pipeline.datasets[i].values.length; j++) {
          if(pipeline.datasets[i].values[j].timestamp > latestDate) {
            latestDate = pipeline.datasets[i].values[j].timestamp;
          }
        }
      }
      return latestDate;
    }

    factory.getStringDatasets = function(pipeline) {
      return pipeline.datasets.filter(function(dataset) {
        return dataset.type == "string";
      });
    }

    factory.getIntDatasets = function(pipeline) {
      return pipeline.datasets.filter(function(dataset) {
        return dataset.type == "int";
      });
    }

    factory.getDatasetKeys = function(pipeline) {
      var keys = [];
      for(var i = 0; i < pipeline.datasets.length; i++) {
        keys.push({name: pipeline.datasets[i].key, checked: true});
      }
      return keys;
    }
 
    return factory;
});

// D3 module
angular.module('d3', [])
.factory('d3Service', ['$document', '$q', '$rootScope', function($document, $q, $rootScope) {
    var d = $q.defer();
    function onScriptLoad() {
      // Load client in the browser
      $rootScope.$apply(function() { d.resolve(window.d3); });
    }
    // Create a script tag with d3 as the source
    // and call our onScriptLoad callback when it
    // has been loaded
    var scriptTag = $document[0].createElement('script');
    scriptTag.type = 'text/javascript'; 
    scriptTag.async = true;
    scriptTag.src = 'bower_components/d3/d3.js';
    scriptTag.onreadystatechange = function () {
      if (this.readyState == 'complete') onScriptLoad();
    }
    scriptTag.onload = onScriptLoad;

    var s = $document[0].getElementsByTagName('body')[0];
    s.appendChild(scriptTag);

    return {
      d3: function() { return d.promise; }
    };
 }]);

