var pipelinr_util = require("../util/util.js");
var models = require('../models/models.js'); 

exports.updateValue = function(io) {
  return function(req, res) {
	  var object = req.body;
	  var _pipeline_id = req.params.pipeline_id;
	  var _dataset_id = req.params.dataset_id;

	  console.log('Update value: ' + _pipeline_id + " in " + _dataset_id);

	  var value = new models.Value({
	    _dataset: _dataset_id,
	    timestamp: object.timestamp,
	    value: object.value,
	    level: object.level
	  });

	  value.save(function(err, value) {
	    if (err) return res.send(pipelinr_util.handleError(err));

		models.Dataset.findOneAndUpdate({_id: _dataset_id}, {$push: {"values": value._id}}, {safe: true, upsert: true})
		.exec(function (err, dataset) {
		        if (err) return res.send(pipelinr_util.handleError(err));
	          	// TODO: io
	            //io.sockets.in('flow').emit('updatedObject', JSON.parse(JSON.stringify({ id: _dataset_id, key: object.key, value: object.value, timestamp: object.timestamp, type: object.type, level: object.level })));
	          	res.send(200, {value: value});
		    }
		);

		/*
		models.Dataset
			.findOne({ _id: _dataset_id })
			.exec(function (err, dataset) {

		  	if (err) return res.send(pipelinr_util.handleError(err));
		  	dataset.values.push(value);
		    dataset.save(function(err, dataset) {
	          if (err) return res.send(pipelinr_util.handleError(err));
	          // TODO: io
	          res.send(200, {value: value});
	        });
		});
	   	res.send(200, {value: value});
	   	*/

	  });
	};
};