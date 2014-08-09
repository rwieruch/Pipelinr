var pipelinr_util = require("../util/util.js");
var models = require('../models/models.js'); 
var reduction_module = require('../pipelinr_modules/reduction_module.js'); 

exports.addPipeline = function(req, res) {
  var object = req.body;
  console.log('Add pipeline: ' + JSON.stringify(object));

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
    .populate('datasets', '_pipeline key type')
    .exec(function(err, pipelines) {
      if (err) return res.send(pipelinr_util.handleError(err));
      res.send(pipelines);
    });
};

exports.findOnePipeline = function(req, res) {
  var _id = req.params.id;
  console.log('Find one pipeline: ' + _id);

  models.Pipeline.findOne({ _id: _id })
  .populate('datasets')
  .exec(function(err, pipeline) {
    if (err) return res.send(pipelinr_util.handleError(err));

    // Populate nested values in pipeline
    models.Dataset.populate(pipeline.datasets, {path:'values'},
       function(err, data){
          if (err) return res.send(pipelinr_util.handleError(err));

          // Use generic datareduction method
          var tools = req.query.tool;
          if(typeof tools !== "undefined") {

            if(typeof tools == "string") { // When it is only one tool
              objectTool = tools;
              tools = [];
              tools.push(objectTool);
            }

            console.log(tools);
            console.log(tools[0]);
            for(var t in tools) {
              jsonTool = JSON.parse(tools[t]);
              var task = reduction_module[jsonTool.task];
              pipeline = task(pipeline, jsonTool);
            }
          }

          res.send(pipeline);
       }
    );  
  });
};

exports.deletePipeline = function(req, res) {
  console.log('Delete pipeline: ' + req.params.id);
  models.Pipeline.remove({ _id: req.params.id }).exec(function (err) {
    if (err) return res.send(pipelinr_util.handleError(err));
    res.send(200, {});
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

