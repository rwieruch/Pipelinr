'use strict';

describe('Controller: IntervalsamplingmodalCtrl', function () {

  // load the controller's module
  beforeEach(module('pipelinrApp'));

  var IntervalsamplingmodalCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    IntervalsamplingmodalCtrl = $controller('IntervalsamplingmodalCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
