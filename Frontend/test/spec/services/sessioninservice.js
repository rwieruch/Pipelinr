'use strict';

describe('Service: SessionInService', function () {

  // load the service's module
  beforeEach(module('pipelinrApp'));

  // instantiate service
  var SessionInService;
  beforeEach(inject(function (_SessionInService_) {
    SessionInService = _SessionInService_;
  }));

  it('should do something', function () {
    expect(!!SessionInService).toBe(true);
  });

});
