  var benchrest = require('bench-rest');

  var flow = {
    main: [
      { get: 'http://localhost:1080/pipelines/542a80fd02ea223c18f1bcd2' }
    ]
  };

  module.exports = flow;