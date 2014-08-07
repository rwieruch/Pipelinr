var pipelinr_util = require("../util/util.js");
var models = require('../models/models.js');

exports.addDataset = function(req, res) {
  var object = req.body;
  var _pipeline_id = req.params.id;
  console.log('addDataset: ' + JSON.stringify(object));
  console.log('in Pipeline: ' + _pipeline_id);

  var dataset = new models.Dataset({
    _pipeline: _pipeline_id,
    key: object.key,
    type: object.type
  });

  // Save new dataset
  dataset.save(function(err, dataset) {
    if (err) return res.send(pipelinr_util.handleError(err));

    // Save ref in pipeline
    models.Pipeline
      .findOne({ _id: _pipeline_id })
      .exec(function (err, pipeline) {
        if (err) return res.send(pipelinr_util.handleError(err));

        pipeline.datasets.push(dataset);
        pipeline.save(function(err, pipeline) {
          if (err) return res.send(pipelinr_util.handleError(err));

          res.send(200, {dataset: dataset});
        });
    });
  });
};

// TODO: do i really need this?
/*exports.findAllDatasetsByPipeline = function(req, res) {
  console.log('Find all datasets by pipeline');
  var _pipeline_id = req.params.id;

  models.Dataset
    .find({ _pipeline: _pipeline_id })
    .exec(function (err, datasets) {
      if (err) return res.send(pipelinr_util.handleError(err));
      console.log(datasets);
      res.send(datasets);
  });
};*/