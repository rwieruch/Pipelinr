var pipelinr_util = require("../util/util.js");
var models = require('../models/models.js'); 

exports.addPipeline = function(req, res) {
  var object = req.body;
  console.log('addPipeline: ' + JSON.stringify(object));

  var pipeline = new models.Pipeline({
    name: object.name,
    origin_id: object.origin_id
  });

  pipeline.save(function(err, pipeline) {
    if (err) return res.send(pipelinr_util.handleError(err));
    console.log(pipeline);
    res.send(200, {pipeline: pipeline});
  });
};

exports.findAllPipelines = function(req, res) {
  console.log('Find all pipelines');

  models.Pipeline.find()
    .populate('datasets', 'key type values') // TODO: remove values, only for testing
    .exec(function(err, pipelines) {
      if (err) return res.send(pipelinr_util.handleError(err));
      res.send(pipelines);
    });
};

exports.findOnePipeline = function(req, res) {
  console.log('Find one pipeline');
  var _id = req.params.id;

  models.Pipeline.findOne({ _id: _id }, function(err, pipeline) {
    if (err) return res.send(pipelinr_util.handleError(err));
    res.send(pipeline);
  });
};

// Vorlage
//exports.myMethod = function(req, res) {
    //var token = req.headers.token;

    // Find session
    //models.Session.findOne({ token: token }, function(err, session) {
    //  if (err|| !session) { res.send(401); return; }

      // TODO

    //});
//};

