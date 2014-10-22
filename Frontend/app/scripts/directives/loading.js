'use strict';

/**
 * @ngdoc directive
 * @name pipelinrApp.directive:loading
 * @description
 * # loading
 */
angular.module('pipelinrApp')
  .directive('loading', function () {
    return {
      restrict: 'E',
      replace:true,
      template: '<div><div class="pipelinr-overlay"></div><div class="pipelinr-invis-modal"><div class="loading"><div id="floatingCirclesG"><div class="f_circleG" id="frotateG_01"></div><div class="f_circleG" id="frotateG_02"></div><div class="f_circleG" id="frotateG_03"></div><div class="f_circleG" id="frotateG_04"></div><div class="f_circleG" id="frotateG_05"></div><div class="f_circleG" id="frotateG_06"></div><div class="f_circleG" id="frotateG_07"></div><div class="f_circleG" id="frotateG_08"></div></div></div></div></div>',
      link: function (scope, element, attr) {
        scope.$watch('rendered', function (val) {
            if (!val)
                $(element).show();
            else
                $(element).hide();
        });
      }
    }
  });
