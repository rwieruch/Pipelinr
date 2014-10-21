var express = require("express");
var app = express();
var cors = require('cors');
var http = require("http").createServer(app);
var io = require('socket.io').listen(http);

// Enable cors
app.use(cors());

// For req.body parser
app.use(require('connect').bodyParser());

// Auth Middleware - This will check if the token is valid
// Only the requests that start with /api/v1/* will be checked for the token.
// Any URL's that do not follow the below pattern should be avoided unless you 
// are sure that authentication is not needed
app.all('/api/v1/*', [require('./middlewares/auth')]);

http.listen(1080);

// Rest models
var pipeline = require('./routes/pipelines');
var dataset = require('./routes/datasets');
var value = require('./routes/values');
var user = require('./routes/users');
var session = require('./routes/sessions');

// Setup agenda and scheduled jobs
var jobSchedule = require('./job-schedule.js');
jobSchedule.setupJobs();

// REST routes
app.post('/users', user.addUser);
app.get('/users', user.findAll);

app.post('/login', session.login);
app.post('/logout', session.logout);

//app.get('/api/v1/pipelines', pipeline.findAllPipelines);
app.post('/pipelines', pipeline.addPipeline);
app.get('/pipelines', pipeline.findAllPipelines);
app.get('/pipelines/:id', pipeline.findOnePipeline);
app.delete('/pipelines/:id', pipeline.deletePipeline);

app.post('/pipelines/:id/datasets', dataset.addDataset);
app.delete('/pipelines/:pipeline_id/datasets/:dataset_id', dataset.deleteDataset);

app.post('/pipelines/:pipeline_id/datasets/:dataset_id/values', value.updateValue);
app.delete('/pipelines/:pipeline_id/datasets/:dataset_id/values', value.deleteAllValues);

// Websockets
var models = require('./models/models.js');

models.pipelineSchema.pre('save', function (next) {
  this._wasNew = this.isNew;
  next();
});
models.pipelineSchema.post('save', function(pipeline) {
  if (this._wasNew) io.sockets.emit('add_pipeline', { pipeline: pipeline });
});

models.datasetSchema.post('save', function(dataset) {
  io.sockets.emit('add_dataset_' + dataset._pipeline, { dataset: dataset });
});

models.valueSchema.post('save', function (value) {
  io.sockets.emit('add_value_' + value._dataset, { value: value });
});

// Clean up sub documents
models.pipelineSchema.pre('remove', function (next) {
  console.log("Removes sub documents of pipeline");
  models.Dataset.find({_pipeline: this._id}, function(err, datasets) {
    for(var i = 0; i < datasets.length; i++) { datasets[i].remove(); }
    next();
  });
});

models.datasetSchema.pre('remove', function (next) {
  console.log("Removes sub documents of dataset");
  models.Value.remove({_dataset: this._id}).exec();
  next();
});

/*models.valueSchema.pre('remove', function (next) {
  console.log("Removes top referenced documents of value");
  
  models.Dataset.update({_id: this._dataset}, {$pull : {'values' : this._id}}, function(err, value){
      if(err) return console.log(err);
        return console.log('success remove', value);
  });

  next();
});*/