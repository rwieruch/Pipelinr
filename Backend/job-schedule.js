exports.setupJobs = function() {
	var samplingDatasetsJob = require('./jobs/sampling-datasets-job.js');

	// Setup agenda
	var Agenda = require("Agenda");
	var agenda = new Agenda({db: { address: 'localhost:27017/pipelinr6'}});

	agenda.define('sampling datasets', samplingDatasetsJob.samplingDatasets(agenda));
	agenda.every('60 seconds', 'sampling datasets');

	agenda.start();
}