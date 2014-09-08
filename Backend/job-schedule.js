exports.setupJobs = function() {
	var samplingDatasetsJob = require('./jobs/sampling-datasets-job.js');

	// Setup agenda
	var Agenda = require("Agenda");
	var agenda = new Agenda({db: { address: 'localhost:27017/pipelinr7'}});

	//agenda.define('sampling datasets', samplingDatasetsJob.samplingDatasets(agenda));
	//agenda.every('15 seconds', 'sampling datasets');

	agenda.start();
}