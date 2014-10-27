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

    for(var i = 0; i < 3; i++) {

    	if(i == 0) 
    		var type = 'string';
    	else
    		var type = 'int';

		  var dataset = new models.Dataset({
		    _pipeline: pipeline._id,
		    key: 'Dataset ' + i,
		    type: type
		  });

	    // Save new dataset
		  dataset.save(function(err, dataset) {
		    if (err) console.log(err);

		    // Save ref in pipeline
		    models.Pipeline
		      .findOne({ _id: dataset._pipeline })
		      .exec(function (err, pipeline) {
		        if (err) console.log(err);

		        pipeline.datasets.push(dataset);
		        pipeline.save(function(err, pipeline) {
		          if (err) console.log(err);
		        });
		    });

		    // Save new values
		    for(var j = 0; j < 500; j++) {
		    	var timestamp = moment().add(j,'second').format('DD MM YYYY, HH:mm:ss:SSS');

          var level = null;
          if(dataset.type === 'string') {
            var levelArray = [
                'warning',
                'error'
            ];
            var randomNumber = Math.floor(Math.random()*levelArray.length);
            level = levelArray[randomNumber];
          }

          var newValue = Math.floor(Math.random() * j%100) + j%50;

				  var value = new models.Value({
				    _dataset: dataset._id,
				    timestamp: timestamp,
				    value: newValue,
				    level: level
				  });

				  value.save(function(err, value) {
				    if (err) console.log(err);
				  });

				}

		  }); 
		}

  });
}