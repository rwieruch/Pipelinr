var models = require('../models/models.js');
var reduction_module = require('../pipelinr_modules/reduction_module.js'); 

exports.samplingDatasets = function(agenda) {
		agenda.define('sampling datasets', function(job, done) {
			console.log("Job: Sampling datasets");
  		//reduction_module.samplingDatasets();

  		// todo: alles ändern: alle pipelienes abfragen und generisch mit ihrem tool übergeben

		  models.Pipeline.find()
		    .populate('datasets')
		    .exec(function(err, pipelines) {
		      for(var i = 0; i < pipelines.length; i++) {
  			    	if(typeof pipelines[i].sampling.task !== 'undefined') { // Only when sampling is defined
  			    		// TODO: chnage to check for null on sampling
	      		    var idArray = [];
						    for(var m = 0; m < pipelines[i].datasets.length; m++) {
						      idArray.push(pipelines[i].datasets[m]._id);
						    }

			      		(function (i, idArray) {
							    models.Value.find({
						        '_dataset': { $in: idArray }
						      })
						      .exec(function (err, values) {
							        for(var j = 0; j < values.length; j++) {
							        	for(var k = 0; k < pipelines[i].datasets.length; k++) {
							        		if(values[j]._dataset.toString() === pipelines[i].datasets[k]._id.toString()) {
							        			pipelines[i].datasets[k].values.push(values[j]);
							        		}
							        	}
							        }

							       // Execute sampling
							       var task = reduction_module[pipelines[i].sampling.task];
            				 pipeline = task(pipelines[i], pipelines[i].sampling);

							    });
						    }(i, idArray));

			      	}
		      }
	    });

	    done();
		});
}