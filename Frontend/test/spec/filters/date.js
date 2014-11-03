'use strict';

describe('Filter: date', function () {

  // load the filter's module
  beforeEach(module('pipelinrApp'));

  // initialize a new instance of the filter before each test
  var date;
  beforeEach(inject(function ($filter) {
    date = $filter('date');
  }));

  it('should return the input prefixed with "date filter:"', function () {
    var text = 'angularjs';
    expect(date(text)).toBe('date filter: ' + text);
  });

});
