  var benchrest = require('bench-rest');

  var flow = {
  	main: [
	   { del: 'http://localhost:1080/pipelines/54087a56807a3ae01584d5c3/datasets/54087eed807a3ae01584ff92/values' }
  	]
  };

  module.exports = flow;