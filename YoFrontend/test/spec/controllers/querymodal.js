'use strict';

describe('Controller: QuerymodalCtrl', function () {

  // load the controller's module
  beforeEach(module('pipelinrApp'));

  var QuerymodalCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    QuerymodalCtrl = $controller('QuerymodalCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
