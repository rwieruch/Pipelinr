var cluster = require('cluster');

if ( cluster.isMaster ) {
  for ( var i=0; i<4; ++i )
    cluster.fork();
} else {

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
var testcase = require('./routes/testcases');
var pipeline = require('./routes/pipelines');
var dataset = require('./routes/datasets');
var value = require('./routes/values');
var user = require('./routes/users');
var sessions = require('./routes/sessions');

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

app.post('/login', sessions.login);
app.post('/logout', sessions.logout);

app.post('/pipelines', pipeline.addPipeline);
app.get('/pipelines', pipeline.findAllPipelines);
app.get('/pipelines/:id', pipeline.findOnePipeline);
app.delete('/pipelines/:id', pipeline.deletePipeline);

app.post('/pipelines/:id/datasets', dataset.addDataset);
// TODO: do i really need this?
//app.get('/pipelines/:id/datasets', dataset.findAllDatasetsByPipeline);

app.post('/pipelines/:pipeline_id/datasets/:dataset_id/values', value.updateValue);

app.get('/testcases/:id', testcase.findById(moment));
app.get('/testcases', testcase.findAll);
app.post('/testcases', testcase.addObject(io));
app.put('/testcases/:id', testcase.updateObject(io));

// Websockets
var models = require('./models/models.js');

models.valueSchema.post('save', function (value) {
  console.log('%s has been saved ............... ', value._id);
  console.log(value);

  //io.sockets.in('flow').emit('updatedObject', JSON.parse(JSON.stringify({ id: _dataset_id, key: object.key, value: object.value, timestamp: object.timestamp, type: object.type, level: object.level })));
});

}