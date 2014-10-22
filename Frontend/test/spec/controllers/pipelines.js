'use strict';

describe('Controller: PipelinesCtrl', function () {

  // load the controller's module
  beforeEach(module('pipelinrApp'));

  var PipelinesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PipelinesCtrl = $controller('PipelinesCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
