'use strict';

describe('Service: TokenInterceptor', function () {

  // load the service's module
  beforeEach(module('pipelinrApp'));

  // instantiate service
  var TokenInterceptor;
  beforeEach(inject(function (_TokenInterceptor_) {
    TokenInterceptor = _TokenInterceptor_;
  }));

  it('should do something', function () {
    expect(!!TokenInterceptor).toBe(true);
  });

});
