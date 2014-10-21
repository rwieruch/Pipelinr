'use strict';

/**
 * @ngdoc function
 * @name pipelinrApp.controller:StratifiedsamplingmodalCtrl
 * @description
 * # StratifiedsamplingmodalCtrl
 * Controller of the pipelinrApp
 */
angular.module('pipelinrApp')
.controller('StratifiedSamplingModalCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
  $scope.sliderConfig = {min: 1, max: 60, step: 1};
  $scope.rate = 1;

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.sendProcess = function(rate) {
		$modalInstance.close({select: true, name: 'Stratified Sampling', tool: {task: 'stratifiedSampling', perm: false, rate: rate} });
  }
}]);
