exports.login = function(req, res) {
    var object = req.body;
    console.log('add session: ' + JSON.stringify(object));

    // Get registered user
    User.findOne({ email: object.email, password: object.password }, function(err, user) {
      if (err) return console.error(err);
      console.log(user);

      // Create session with token
      var timestamp = new Date();
      var plainToken =  object.email+":"+object.password+":"+timestamp;
      //var token =  base64_encode(plainToken);
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
          res.send('Error');
          return;
        }

        res.send({token: session.token});
      });

    });
};