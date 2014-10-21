'use strict';

describe('Service: d3Service', function () {

  // load the service's module
  beforeEach(module('pipelinrApp'));

  // instantiate service
  var d3Service;
  beforeEach(inject(function (_d3Service_) {
    d3Service = _d3Service_;
  }));

  it('should do something', function () {
    expect(!!d3Service).toBe(true);
  });

});
