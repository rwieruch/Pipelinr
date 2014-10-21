'use strict';

describe('Service: DataProcessing', function () {

  // load the service's module
  beforeEach(module('pipelinrApp'));

  // instantiate service
  var DataProcessing;
  beforeEach(inject(function (_DataProcessing_) {
    DataProcessing = _DataProcessing_;
  }));

  it('should do something', function () {
    expect(!!DataProcessing).toBe(true);
  });

});
