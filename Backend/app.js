// Application and WebSocket initiation
var express = require("express");
var app = express();
var cors = require('cors');
var http = require("http").createServer(app);
var io = require('socket.io').listen(http);

// Enable cors
app.use(cors());

// For req.body parser
app.use(require('connect').bodyParser());

http.listen(1080);

// Utility libs
var _ = require("underscore");

// Rest models
testcase = require('./routes/testcases');
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
                timestamp: String
            }]
         }]
  });

  // Compile models using the schema as the structure
  // Mongoose also creates a MongoDB collection called 'User' for these documents.
  User = mongoose.model('User', userSchema);
  Session = mongoose.model('Session', sessionSchema);
  Testcase = mongoose.model('Testcase', testcaseSchema);
});

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

app.get('/testcases/:id', testcase.findById);
app.get('/testcases', testcase.findAll);
app.post('/testcases', testcase.addObject);
//app.post('/testcases', testcase.addObject(io));
app.put('/testcases/:id', testcase.updateObject(io));