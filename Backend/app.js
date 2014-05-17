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
        required: true,
        unique: true
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

  // Compile models using the schema as the structure
  // Mongoose also creates a MongoDB collection called 'User' for these documents.
  User = mongoose.model('User', userSchema);
  Session = mongoose.model('Session', sessionSchema);
});

mongoose.connect('mongodb://localhost/pipelinr');

// Realtime
io.sockets.on('connection', function (socket) {

  socket.join('flow');

  setInterval(function(){
    socket.emit('connectionStatus', 'ping');
  },10000);

});

base64_encode = function base64_encode(data) {
  //  discuss at: http://phpjs.org/functions/base64_encode/
  // original by: Tyler Akins (http://rumkin.com)
  // improved by: Bayron Guevara
  // improved by: Thunder.m
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Rafał Kukawski (http://kukawski.pl)
  // bugfixed by: Pellentesque Malesuada
  //   example 1: base64_encode('Kevin van Zonneveld');
  //   returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
  //   example 2: base64_encode('a');
  //   returns 2: 'YQ=='

  var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
    ac = 0,
    enc = '',
    tmp_arr = [];

  if (!data) {
    return data;
  }

  do { // pack three octets into four hexets
    o1 = data.charCodeAt(i++);
    o2 = data.charCodeAt(i++);
    o3 = data.charCodeAt(i++);

    bits = o1 << 16 | o2 << 8 | o3;

    h1 = bits >> 18 & 0x3f;
    h2 = bits >> 12 & 0x3f;
    h3 = bits >> 6 & 0x3f;
    h4 = bits & 0x3f;

    // use hexets to index into b64, and append result to encoded string
    tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
  } while (i < data.length);

  enc = tmp_arr.join('');

  var r = data.length % 3;

  return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
}

// REST routes
app.post('/users', user.addUser);
app.get('/users', user.findAll);

app.post('/login', sessions.login);
//app.post('/logout', sessions.logout);

app.get('/testcases/:id', testcase.findById);
app.get('/testcases', testcase.findAll);
app.post('/testcases', testcase.addObject(io));
app.put('/testcases/:id', testcase.updateObject(io));