var models = require('../models/models.js');

exports.giveDatabase = function(agenda) {
	agenda.define('give database', function(job, done) {
		console.log("Job: Give database");
		models.Pipeline
			.find({}, function (err, pipelines) {
				console.log("Pipelines:")
				console.log(pipelines.length);
			});
		models.Dataset
			.find({}, function (err, datasets) {
				console.log("Datasets:")
				console.log(datasets.length);
			});
		models.Value
			.find({}, function (err, values) {
				console.log("Values:")
				console.log(values.length);
			});
	    done();
	});
}