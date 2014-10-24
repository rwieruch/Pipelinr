var pipelinr_util = require("../util/util.js");
var models = require('../models/models.js'); 
var reduction_module = require('../pipelinr_modules/reduction_module.js'); 
var moment = require('moment');

exports.addPipeline = function(req, res) {
  var object = req.body;
  console.log('Add pipeline: ' + JSON.stringify(object));

  var sampling = null;
  if(object.sampling !== null) {
    sampling = { task: object.sampling.task, perm: object.sampling.perm, rate: object.sampling.rate };
  }

  var pipeline = new models.Pipeline({
    name: object.name,
    sampling: sampling,
    _user: req.user._id // TODO:change this
  });

  pipeline.save(function(err, pipeline) {
    if (err) return res.send(pipelinr_util.handleError(err));
    console.log(pipeline);
    res.send(200, {pipeline: pipeline});
  });
};

exports.findAllPipelines = function(req, res) {
  console.log('Find all pipelines');

  console.log(req.user);

  models.Pipeline.find({ _user: req.user._id })
  //models.Pipeline.find()
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

    var idArray = [];
    for(var i = 0; i < pipeline.datasets.length; i++) {
      idArray.push(pipeline.datasets[i]._id);
    }

    models.Value
      .find({
        '_dataset': { $in: idArray }
      })
      .exec(function (err, values) {
        if (err) return res.send(pipelinr_util.handleError(err));

        for(var j = 0; j < values.length; j++) {
          for(var k = 0; k < pipeline.datasets.length; k++) {
            if(pipeline.datasets[k]._id.toString() === values[j]._dataset.toString()) {
              pipeline.datasets[k].values.push(values[j]);
            }
          }
        }

        // Sort date
        for(var k = 0; k < pipeline.datasets.length; k++) {
          pipeline.datasets[k].values.sort(function(a,b){
            a = moment(a.timestamp, 'DD MM YYYY, HH:mm:ss:SSS');
            b = moment(b.timestamp, 'DD MM YYYY, HH:mm:ss:SSS');
            return a>b ? 1 : a<b ? -1 : 0;
          });
        }

        // Use generic datareduction method
        var tools = req.query.tool;
        console.log(tools);
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
      });

  });
};

exports.deletePipeline = function(req, res) {
  console.log('Delete pipeline: ' + req.params.id);
  models.Pipeline.findOne({ _id: req.params.id }, function(err, pipeline) {
    if (err) return res.send(pipelinr_util.handleError(err));
    pipeline.remove();
    res.send(200, {});
  });
};

