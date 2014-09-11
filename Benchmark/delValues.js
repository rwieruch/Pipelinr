  var benchrest = require('bench-rest');

  var flow = {
  	main: [
	   { del: 'http://localhost:1080/pipelines/540d8a96ca2bd9701a1e43ba/datasets/540d8aa5ca2bd9701a1e43bb/values' }
  	]
  };

  module.exports = flow;