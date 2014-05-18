exports.login = function(req, res) {
    var object = req.body;
    console.log('add session: ' + JSON.stringify(object));

    // Get registered user
    User.findOne({ email: object.email, password: object.password }, function(err, user) {
      if (err) res.send({ msg: "Error: Can't find user."});
      console.log(user);

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

      session.save(function(err, session) {

        if ( err && err.code) {
          console.log(err);
          console.log(err.code);
          res.send({ msg: "Error: Can't delete user."});
          return;
        }

        res.send({token: session.token});
      });
    });
};

exports.logout = function(req, res) {
    var token = req.headers.token;
    console.log('remove session: ' + token);

    Session.findOne({ token: token }, function(err, session) {
      if (err) return res.send({ msg: "Unauthroized."});
      console.log(session);

      session.remove(function(err, session) {

        if ( err && err.code) {
          console.log(err);
          console.log(err.code);
          res.send({ msg: "Error: Can't delete session."});
          return;
        }

        res.send({ msg: "User logged out."});
      });
    });
};