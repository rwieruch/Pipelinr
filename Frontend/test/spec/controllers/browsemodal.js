'use strict';

describe('Controller: BrowsemodalCtrl', function () {

  // load the controller's module
  beforeEach(module('pipelinrApp'));

  var BrowsemodalCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    BrowsemodalCtrl = $controller('BrowsemodalCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
