exports.login = function(req, res) {
    var object = req.body;
    console.log('add session: ' + JSON.stringify(object));

    // Get registered user
    User.findOne({ email: object.email, password: object.password }, function(err, user) {
      if (err || !user) { res.send(404); return; }

      // Create session with token
      var timestamp = new Date();
      var plainToken =  object.email+":"+object.password+":"+timestamp;
      var token = new Buffer(plainToken).toString('base64');

      console.log("Token created: " + token);

      var session = new Session({
            email: object.email,
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
    Session.findOne({ token: token }, function(err, session) {
      if (err) { res.send(401); return; }
      
      console.log("Session retireved: " + session);

      // Remove session
      session.remove(function(err, session) {
        if ( err && err.code) { res.send(404); return; }
        res.send(200);
      });
    });
};