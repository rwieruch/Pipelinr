var models = require('../models/models.js');
var reduction_module = require('../pipelinr_modules/reduction_module.js'); 

exports.samplingDatasets = function(agenda) {
	 return function() {
		agenda.define('sampling datasets', function(job, done) {
			console.log("Sampling datasets");
		  models.Dataset
		    .find({}, function (err, datasets) {
		      if (err) return res.send(pipelinr_util.handleError(err));
		      console.log("Datasets");
	      	console.log(datasets.length);
		      for(var i = 0; i < datasets.length; i++) {
		      	//console.log(datasets[i].values.length);
		      	//if(datasets[i].values.length > 1000) {
		      	//	reduction_module.samplingDatasets(datasets[i]);
		      	//}
		      }
		  });
		  models.Value
		    .find({}, function (err, values) {
		      if (err) return res.send(pipelinr_util.handleError(err));
		      console.log("Values");
	      	console.log(values.length);
		  });
	    done();
		});
	}
}