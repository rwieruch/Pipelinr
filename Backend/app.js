// Application and WebSocket initiation
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

// Third party utility libs
var _ = require("underscore");

// Rest models
testcase = require('./routes/testcases');
pipeline = require('./routes/pipelines');
dataset = require('./routes/datasets');
user = require('./routes/users');
sessions = require('./routes/sessions');

// Enables MongoDB
var mongoose = require('mongoose');
var db = mongoose.connection;

db.on('error', console.error);
db.once('open', function() {

  // Create your schemas and models here
  var userSchema = new mongoose.Schema({
    email: {
        type:String,
        required: true,
        unique: true
    },
    username: {
        type:String,
        required: true
    },
    password: {
        type:String,
        required: true
    }
  });

  var sessionSchema = new mongoose.Schema({
    email: {
        type:String,
        required: true
    },
    token: {
        type:String,
        required: true
    },
    timestamp: {
        type:Date,
        required: true
    }
  });

  var testcaseSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true
    },
    origin_id: {
        type:String,
        required: true,
        unique: true
    },
    datasets : [{
        key : { type:String },
        type : { type:String },
        values : [{
                value: String,
                timestamp: String,
                level: String
            }]
         }]
  });

  var pipelineSchema = new mongoose.Schema({
    name: String,
    origin_id: String,
    datasets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dataset' }]
  });

  var datasetSchema = new mongoose.Schema({
    _pipeline: {type: mongoose.Schema.Types.ObjectId, ref: 'Pipeline'},
    key: String,
    type: String//,
    //TODO values
  });

  // Compile models using the schema as the structure
  // Mongoose also creates a MongoDB collection called 'User' for these documents.
  User = mongoose.model('User', userSchema);
  Session = mongoose.model('Session', sessionSchema);
  Testcase = mongoose.model('Testcase', testcaseSchema);
  Pipeline = mongoose.model('Pipeline', pipelineSchema);
  Dataset = mongoose.model('Dataset', datasetSchema);
});

/*console.log("nostradamus");
var ts = require("timeseries-analysis")
  , data = [['28 05 1988, 04:04:04',5], 
            ['29 05 1988, 04:04:04',7], 
            ['30 05 1988, 04:04:04',2], 
            ['01 06 1988, 04:04:04',3], 
            ['02 06 1988, 04:04:04',4],
            ['03 06 1988, 04:04:04',4],
            ['04 06 1988, 04:04:04',4],
            ['05 06 1988, 04:04:04',4],
            ['06 06 1988, 04:04:04',30],
            ['07 06 1988, 04:04:04',4],
            ['08 06 1988, 04:04:04',4],
            ['09 06 1988, 04:04:04',4],
            ['28 06 1988, 04:04:04',5],
            ['29 06 1988, 04:04:04',6],
            ['30 06 1988, 04:04:04',7]];
var t     = new ts.main(data);
//var t         = new ts.main(ts.adapter.sin({cycles:4}));

// We're going to forecast the 11th datapoint
var forecastDatapoint    = 11;    

// We calculate the AR coefficients of the 10 previous points
var coeffs = t.ARMaxEntropy({
    data:    t.data.slice(0,10)
});

// Output the coefficients to the console
console.log(coeffs);

// Now, we calculate the forecasted value of that 11th datapoint using the AR coefficients:
var forecast    = 0;    // Init the value at 0.
for (var i=0;i<coeffs.length;i++) {    // Loop through the coefficients
    forecast -= t.data[10-i][1]*coeffs[i];
    // Explanation for that line:
    // t.data contains the current dataset, which is in the format [ [date, value], [date,value], ... ]
    // For each coefficient, we substract from "forecast" the value of the "N - x" datapoint's value, multiplicated by the coefficient, where N is the last known datapoint value, and x is the coefficient's index.
}
console.log("forecast",forecast);
// Output: 92.7237232432106*/

mongoose.connect('mongodb://localhost/pipelinr');

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

app.get('/testcases/:id', testcase.findById(moment));
app.get('/testcases', testcase.findAll);
app.post('/testcases', testcase.addObject(io));
app.put('/testcases/:id', testcase.updateObject(io));