var models = require('../models/models.js');
var reduction_module = require('../pipelinr_modules/reduction_module.js'); 

exports.samplingDatasets = function(agenda) {
		agenda.define('sampling datasets', function(job, done) {
			console.log("Job: Sampling datasets");
  		reduction_module.samplingDatasets();
	    done();
		});
}