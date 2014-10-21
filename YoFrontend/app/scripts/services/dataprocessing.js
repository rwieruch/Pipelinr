'use strict';

/**
 * @ngdoc service
 * @name pipelinrApp.DataProcessing
 * @description
 * # DataProcessing
 * Factory in the pipelinrApp.
 */
angular.module('pipelinrApp')
  .factory('DataProcessing', function () {
     
    var factory = {}; 
 
    factory.allSortedDates = function(pipeline) {
      var allSortedDates = [];
      for(var i = 0; i < pipeline.datasets.length; i++) {
        for(var j = 0; j < pipeline.datasets[i].values.length; j++) {
          allSortedDates.push(pipeline.datasets[i].values[j].timestamp);
        }
      }
      allSortedDates.sort(function(a,b){
        a = moment(a.timestamp, 'DD MM YYYY, HH:mm:ss:SSS');
        b = moment(b.timestamp, 'DD MM YYYY, HH:mm:ss:SSS');
        return a>b ? 1 : a<b ? -1 : 0;
      });
      return allSortedDates;
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
