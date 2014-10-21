'use strict';

/**
 * @ngdoc function
 * @name pipelinrApp.controller:RandomsamplingmodalCtrl
 * @description
 * # RandomsamplingmodalCtrl
 * Controller of the pipelinrApp
 */
angular.module('pipelinrApp')
.controller('RandomSamplingModalCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
  $scope.sliderConfig = {min: 1, max: 99, step: 1};
  $scope.rate = 1;

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.sendProcess = function(rate) {
		$modalInstance.close({select: true, name: 'Random Sampling', tool: {task: 'randomSampling', perm: false, rate: rate} });
  }
}]);
