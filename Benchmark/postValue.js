  var benchrest = require('bench-rest');

  var flow = {
    main: [
      { post: 'http://localhost:1080/pipelines/54087a56807a3ae01584d5c3/datasets/540c88980b021d140ef1594c/values', json: {value: '23', timestamp: '03 09 2014, 12:42:12:564'}  }
    ]
  };

  module.exports = flow;