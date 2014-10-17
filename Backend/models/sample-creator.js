var moment = require('moment');
var models = require('../models/models.js'); 

exports.createSample = function(user) {
	console.log("sample-creator.js");
	console.log(moment() + " " + user.email);

  var pipeline = new models.Pipeline({
    name: user.username + "'s Pipeline",
    sampling: null,
    _user: user._id
  });

	pipeline.save(function(err, pipeline) {
    if (err) return console.log(err);
    console.log(pipeline);
  });
}