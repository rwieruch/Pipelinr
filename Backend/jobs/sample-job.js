exports.showMessage = function(agenda) {
	 return function() {
		agenda.define('show message', function(job, done) {
		  console.log("Shows message.");
		  done();
		});
	}
}