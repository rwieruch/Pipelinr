'use strict';

/**
 * @ngdoc function
 * @name pipelinrApp.controller:QuerymodalCtrl
 * @description
 * # QuerymodalCtrl
 * Controller of the pipelinrApp
 */
angular.module('pipelinrApp')
.controller('QueryModalCtrl', ['$scope', '$modalInstance', '$routeParams', 'pipeline', 'DataProcessing', 'Socket', 'PipelineService', function ($scope, $modalInstance, $routeParams, pipeline, DataProcessing, Socket, PipelineService) {
	console.log(pipeline);
	$scope.pipeline = pipeline;

	// Datepickers
	var allSortedDates = DataProcessing.allSortedDates(pipeline);
	$scope.earliestDate = moment(allSortedDates[0]).format('DD.MM.YYYY, HH:mm');
	$scope.latestDate = moment(allSortedDates[allSortedDates.length-1]).format('DD.MM.YYYY, HH:mm');
	$scope.minDate = moment(allSortedDates[0],'DD.MM.YYYY, HH:mm').format('MM.DD.YYYY');
	var beginInitDate = moment(allSortedDates[0],'DD.MM.YYYY, HH:mm').format('DD.MM.YYYY');
	$scope.maxDate = moment(allSortedDates[allSortedDates.length-1],'DD.MM.YYYY, HH:mm').format('MM.DD.YYYY');
	var endInitDate = moment(allSortedDates[allSortedDates.length-1],'DD.MM.YYYY, HH:mm').format('DD.MM.YYYY');
	$scope.process = { beginDate: beginInitDate, endDate: endInitDate };

  $scope.calendar = {
	    opened: {},
	    dateFormat: 'dd.MM.yyyy',
	    dateOptions: {},
	    open: function($event, which) {
	        $event.preventDefault();
	        $event.stopPropagation();
	        $scope.calendar.opened[which] = true;
	    } 
	};

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  // Get Pipeline with tools
  $scope.sendProcess = function(process) {
		if(typeof process !== 'undefined') {
			var beginDatetime = moment(process.beginDate, 'DD.MM.YYYY').format('DD MM YYYY') + ', ' + moment(process.beginTime).format('HH:mm:ss');
  		var endDatetime = moment(process.endDate, 'DD.MM.YYYY').format('DD MM YYYY') + ', ' + moment(process.endTime).format('HH:mm:ss');
		} else {
			var beginDatetime = '';
			var endDatetime = '';
		}
		
		var process = {select: true, name: 'Query Time', tool: {begin: beginDatetime, end: endDatetime, task: "trimPipeline"} };
		$modalInstance.close(process);
  }
}]);
