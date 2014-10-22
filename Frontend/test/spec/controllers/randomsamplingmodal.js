'use strict';

describe('Controller: RandomsamplingmodalCtrl', function () {

  // load the controller's module
  beforeEach(module('pipelinrApp'));

  var RandomsamplingmodalCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RandomsamplingmodalCtrl = $controller('RandomsamplingmodalCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
