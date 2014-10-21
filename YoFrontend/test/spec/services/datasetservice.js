'use strict';

describe('Service: DatasetService', function () {

  // load the service's module
  beforeEach(module('pipelinrApp'));

  // instantiate service
  var DatasetService;
  beforeEach(inject(function (_DatasetService_) {
    DatasetService = _DatasetService_;
  }));

  it('should do something', function () {
    expect(!!DatasetService).toBe(true);
  });

});
