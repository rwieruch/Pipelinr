var models = require('../models/models.js'); 
var moment = require('moment');

exports.login = function(req, res) {
    var object = req.body;
    console.log('add session: ' + JSON.stringify(object));

    // Get registered user
    models.User.findOne( { $or:[{ email: object.email, password: object.password }, { username: object.email, password: object.password }] }, function(err, user) {
      if (err || !user) { res.send(404); return; }

      // Create session with token
      var timestamp = moment();
      var plainToken =  user.email+":"+user.password+":"+timestamp;
      var token = new Buffer(plainToken).toString('base64');

      console.log("Token created: " + token);

      var session = new models.Session({
            email: user.email,
            timestamp: timestamp,
            token: token
      });

      console.log("Session created: " + session);

      // Save session in db
      session.save(function(err, session) {
        if ( err && err.code) { res.send(404); return; }
        res.send(200,{token: session.token});
      });
    });
};

exports.logout = function(req, res) {
    var token = req.headers.token;
    console.log('remove session: ' + token);

    // Find session
    models.Session.findOne({ token: token }, function(err, session) {
      if (err || !session) { res.send(401); return; }
      
      console.log("Session retireved: " + session);

      // Remove session
      session.remove(function(err, session) {
        if ( err && err.code) { res.send(404); return; }
        res.send(200);
      });
    });
};