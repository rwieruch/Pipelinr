'use strict';

describe('Service: SessionOutService', function () {

  // load the service's module
  beforeEach(module('pipelinrApp'));

  // instantiate service
  var SessionOutService;
  beforeEach(inject(function (_SessionOutService_) {
    SessionOutService = _SessionOutService_;
  }));

  it('should do something', function () {
    expect(!!SessionOutService).toBe(true);
  });

});
