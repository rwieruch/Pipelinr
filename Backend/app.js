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
testcase = require('./routes/testcases');
pipeline = require('./routes/pipelines');
dataset = require('./routes/datasets');
value = require('./routes/values');
user = require('./routes/users');
sessions = require('./routes/sessions');

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

app.post('/pipelines/:id/datasets', dataset.addDataset);
app.get('/pipelines/:id/datasets', dataset.findAllDatasetsByPipeline);

app.post('/pipelines/:pipeline_id/datasets/:dataset_id/values', value.updateValue(io));

app.get('/testcases/:id', testcase.findById(moment));
app.get('/testcases', testcase.findAll);
app.post('/testcases', testcase.addObject(io));
app.put('/testcases/:id', testcase.updateObject(io));