  var benchrest = require('bench-rest');

  var flow = {
  	main: [
	   { del: 'http://localhost:1080/pipelines/542a80fd02ea223c18f1bcd2/datasets/542a810902ea223c18f1bcd3/values' }
  	]
  };

  module.exports = flow;