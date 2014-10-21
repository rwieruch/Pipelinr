'use strict';

describe('Directive: pipelinrDashboard', function () {

  // load the directive's module
  beforeEach(module('pipelinrApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<pipelinr-dashboard></pipelinr-dashboard>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the pipelinrDashboard directive');
  }));
});
