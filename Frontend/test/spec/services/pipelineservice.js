'use strict';

describe('Service: PipelineService', function () {

  // load the service's module
  beforeEach(module('pipelinrApp'));

  // instantiate service
  var PipelineService;
  beforeEach(inject(function (_PipelineService_) {
    PipelineService = _PipelineService_;
  }));

  it('should do something', function () {
    expect(!!PipelineService).toBe(true);
  });

});
