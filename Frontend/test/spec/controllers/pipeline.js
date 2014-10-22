'use strict';

describe('Controller: PipelineCtrl', function () {

  // load the controller's module
  beforeEach(module('pipelinrApp'));

  var PipelineCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PipelineCtrl = $controller('PipelineCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
