var pipelinr_util = require("../util/util.js");

exports.addPipeline = function(req, res) {
  var object = req.body;
  console.log('addPipeline: ' + JSON.stringify(object));

  var pipeline = new Pipeline({
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

  Pipeline.find(function(err, pipelines) {
    if (err) return res.send(pipelinr_util.handleError(err));
    res.send(pipelines);
  });
};

// Vorlage
//exports.myMethod = function(req, res) {
    //var token = req.headers.token;

    // Find session
    //Session.findOne({ token: token }, function(err, session) {
    //  if (err|| !session) { res.send(401); return; }

      // TODO

    //});
//};

