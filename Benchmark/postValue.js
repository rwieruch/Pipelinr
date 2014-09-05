  var benchrest = require('bench-rest');

  var flow = {
  	before: [
	  { del: 'http://localhost:1080/pipelines/54087a56807a3ae01584d5c3/datasets/54087eed807a3ae01584ff92/values' }
  	],
    main: [
      { post: 'http://localhost:1080/pipelines/54087a56807a3ae01584d5c3/datasets/54087eed807a3ae01584ff92/values', json: {value: 'newValue', level: 'error', timestamp: '03 09 2014, 12:42:12:564'}  }
    ]
  };

  module.exports = flow;