'use strict';

/**
 * @ngdoc service
 * @name pipelinrApp.Socket
 * @description
 * # Socket
 * Factory in the pipelinrApp.
 */
angular.module('pipelinrApp')
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
});
