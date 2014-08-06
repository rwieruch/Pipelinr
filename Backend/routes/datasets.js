var pipelinr_util = require("../util/util.js");

exports.addDataset = function(req, res) {
  var object = req.body;
  var _pipeline_id = req.params.id;
  console.log('addDataset: ' + JSON.stringify(object));
  console.log('in Pipeline: ' + _pipeline_id);

  var dataset = new Dataset({
    _pipeline: _pipeline_id,
    key: object.key,
    type: object.type
  });

  // Save new dataset
  dataset.save(function(err, dataset) {
    if (err) return res.send(pipelinr_util.handleError(err));

    // Save ref in pipeline
    Pipeline
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