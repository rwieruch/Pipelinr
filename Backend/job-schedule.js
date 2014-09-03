exports.setupJobs = function() {
	var samplingDatasetsJob = require('./jobs/sampling-datasets-job.js');

	// Setup agenda
	var Agenda = require("Agenda");
	var agenda = new Agenda({db: { address: 'localhost:27017/pipelinr3'}});

	agenda.define('sampling datasets', samplingDatasetsJob.samplingDatasets(agenda));
	agenda.every('5 seconds', 'sampling datasets');

	agenda.start();
}