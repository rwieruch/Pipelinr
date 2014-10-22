'use strict';

/**
 * @ngdoc function
 * @name pipelinrApp.controller:IntervalsamplingmodalCtrl
 * @description
 * # IntervalsamplingmodalCtrl
 * Controller of the pipelinrApp
 */
angular.module('pipelinrApp')
.controller('IntervalSamplingModalCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
  $scope.sliderConfig = {min: 1, max: 60, step: 1};
  $scope.rate = 1;

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.sendProcess = function(rate) {
		$modalInstance.close({select: true, name: 'Interval Sampling', tool: {task: 'intervalSampling', perm: false, rate: rate} });
  }
}]);
