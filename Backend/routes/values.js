var pipelinr_util = require("../util/util.js");

exports.updateValue = function(req, res) {
  var object = req.body;
  var _pipeline_id = req.params.pipeline_id;
  var _dataset_id = req.params.dataset_id;

  //console.log(_pipeline_id);
  //console.log(_dataset_id);

  var value = new Value({
    _dataset: _dataset_id,
    timestamp: object.timestamp,
    value: object.value,
    level: object.level
  });

  value.save(function(err, value) {
    if (err) return res.send(pipelinr_util.handleError(err));
	/*
	Dataset
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
	Dataset.findOneAndUpdate({_id: _dataset_id }, {$push: {"values": value._id}}, {safe: true, upsert: true})
	.exec(function (err, dataset) {
	        if (err) return res.send(pipelinr_util.handleError(err));
          	// TODO: io
          	res.send(200, {value: value});
	    }
	);
  });
};