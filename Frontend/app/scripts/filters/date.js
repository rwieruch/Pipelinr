'use strict';

/**
 * @ngdoc filter
 * @name pipelinrApp.filter:date
 * @function
 * @description
 * # date
 * Filter in the pipelinrApp.
 */
angular.module('pipelinrApp')
  .filter('date', function () {
    return function (input) {
      return moment(input,'DD MM YYYY, HH:mm:ss:SSS').format('DD.MM.YYYY, HH:mm:ss:SSS');
    };
  });
