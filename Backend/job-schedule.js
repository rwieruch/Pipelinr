exports.setupJobs = function() {
	var samplingDatasetsJob = require('./jobs/sampling-datasets-job.js');
	var giveDatabaseJob = require('./jobs/give-database-job.js');

	// Setup agenda
	var Agenda = require("Agenda");
	var agenda = new Agenda({db: { address: 'localhost:27017/pipelinr50'}});

	giveDatabaseJob.giveDatabase(agenda);
	agenda.every('5 seconds', 'give database');

	samplingDatasetsJob.samplingDatasets(agenda);
	agenda.every('5 seconds', 'sampling datasets');

	agenda.start();
}