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

// Enables MongoDB
var mongo = require('mongodb');
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
    ObjectID = mongo.ObjectID;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('pipelinrDB', server);

// Connect to database
db.open(function(err, db) {
    if(!err) {
        console.log("Connected to database");

        // Init database tables
        db.collection('testcases', function(err, collection) {});
        db.collection('users', function(err, collection) {});
    }
});

// Realtime
io.sockets.on('connection', function (socket) {

  socket.join('flow');

  setInterval(function(){
    socket.emit('connectionStatus', 'ping');
  },10000);

});

// REST routes
app.post('/users', user.addUser);
app.get('/users', user.findAll);

app.get('/testcases/:id', testcase.findById);
app.get('/testcases', testcase.findAll);
app.post('/testcases', testcase.addObject(io));
app.put('/testcases/:id', testcase.updateObject(io));