'use strict';

/**
 * @ngdoc directive
 * @name pipelinrApp.directive:slider
 * @description
 * # slider
 */
angular.module('pipelinrApp')
  .directive('slider', function () {
	  return {
	    restrict: 'A',
	    scope: {
	        config: "=config",
	        rate: "=model"
	    },
	    link: function(scope, elem, attrs) {           
	      $(elem).slider({
	      	range: false,
	        min: scope.config.min,
	        max: scope.config.max,
	        step: scope.config.step,
	        slide: function(event, ui) { 
	          scope.$apply(function() {
	            scope.rate = ui.value;
	          });
	        }
		    });
			}
	  }
  });
