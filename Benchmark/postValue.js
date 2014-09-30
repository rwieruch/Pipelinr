  var benchrest = require('bench-rest');

  var flow = {
    main: [
      { post: 'http://localhost:1080/pipelines/542a80fd02ea223c18f1bcd2/datasets/542a810902ea223c18f1bcd3/values', json: {value: '23', timestamp: '03 09 2014, 12:42:12:564'}  }
    ]
  };

  module.exports = flow;