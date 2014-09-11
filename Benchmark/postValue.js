  var benchrest = require('bench-rest');

  var flow = {
    main: [
      { post: 'http://localhost:1080/pipelines/540d8a96ca2bd9701a1e43ba/datasets/540d8aa5ca2bd9701a1e43bb/values', json: {value: '23', timestamp: '03 09 2014, 12:42:12:564'}  }
    ]
  };

  module.exports = flow;