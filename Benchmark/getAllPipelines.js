  var benchrest = require('bench-rest');

  var flow = {
    main: [
      { get: 'http://localhost:1080/pipelines' }
    ]
  };

  module.exports = flow;