/*var cluster = require('cluster'),
  numberOfCores = require('os').cpus().length;

if ( cluster.isMaster ) {
  for ( var i=0; i<numberOfCores; ++i )
    cluster.fork();
} else {*/

var express = require("express");
var app = express();
var cors = require('cors');
var http = require("http").createServer(app);
var io = require('socket.io').listen(http);
var moment = require('moment');

// Enable cors
app.use(cors());

// For req.body parser
app.use(require('connect').bodyParser());

http.listen(1080);

var _ = require("underscore");

// Rest models
var pipeline = require('./routes/pipelines');
var dataset = require('./routes/datasets');
var value = require('./routes/values');
var user = require('./routes/users');
var session = require('./routes/sessions');

// Realtime
io.sockets.on('connection', function (socket) {

  socket.join('flow');

  console.log("ping");

  setInterval(function(){
    socket.emit('connectionStatus', 'ping');
  },10000);

});

// REST routes
app.post('/users', user.addUser);
app.get('/users', user.findAll);

app.post('/login', session.login);
app.post('/logout', session.logout);

app.post('/pipelines', pipeline.addPipeline);
app.get('/pipelines', pipeline.findAllPipelines);
app.get('/pipelines/:id', pipeline.findOnePipeline);
app.delete('/pipelines/:id', pipeline.deletePipeline);

app.post('/pipelines/:id/datasets', dataset.addDataset);
// TODO: do i really need this?
//app.get('/pipelines/:id/datasets', dataset.findAllDatasetsByPipeline);

app.post('/pipelines/:pipeline_id/datasets/:dataset_id/values', value.updateValue);

// Websockets
var models = require('./models/models.js');

models.pipelineSchema.pre('save', function (next) {
  this._wasNew = this.isNew;
  next();
});
models.pipelineSchema.post('save', function(pipeline) {
  if (this._wasNew) io.sockets.emit('add_pipeline', { pipeline: pipeline });
});

models.valueSchema.post('save', function (value) {
  console.log('%s has been saved', value._id);
  console.log(value);
  console.log(value._dataset);
  io.sockets.emit('add_value_' + value._dataset, { value: value });
  //io.sockets.in('flow').emit('updatedObject', JSON.parse(JSON.stringify({ id: _dataset_id, key: object.key, value: object.value, timestamp: object.timestamp, type: object.type, level: object.level })));
});

//}