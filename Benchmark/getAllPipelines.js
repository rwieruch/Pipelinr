  var benchrest = require('bench-rest');

  var flow = {
    main: [
      { get: 'http://localhost:1080/pipelines/540d8a96ca2bd9701a1e43ba' }
    ]
  };

  module.exports = flow;