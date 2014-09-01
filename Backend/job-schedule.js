exports.setupJobs = function() {
	var sampleJob = require('./jobs/sample-job.js');

	// Setup agenda
	var Agenda = require("Agenda");
	var agenda = new Agenda({db: { address: 'localhost:27017/pipelinr'}});

	agenda.define('show message', sampleJob.showMessage(agenda));
	agenda.every('5 seconds', 'show message');

	agenda.start();
}