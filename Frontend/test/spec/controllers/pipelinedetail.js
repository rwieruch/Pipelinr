'use strict';

describe('Controller: PipelineDetailCtrl', function () {

  // load the controller's module
  beforeEach(module('pipelinrApp'));

  var PipelinedetailCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PipelinedetailCtrl = $controller('PipelineDetailCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
