'use strict';

describe('Directive: pipelinrPointGraph', function () {

  // load the directive's module
  beforeEach(module('pipelinrApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<pipelinr-point-graph></pipelinr-point-graph>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the pipelinrPointGraph directive');
  }));
});
