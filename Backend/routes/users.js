exports.addUser = function(req, res) {
    var object = req.body;
    console.log('add user: ' + JSON.stringify(object));

    var user = new User({
          email: object.email
        , username: object.name
        , password: object.password
    });

    user.save(function(err, user) {

      if ( err && err.code !== 11000 ) {
        console.log(err);
        console.log(err.code);
        res.send('Another error showed up');
        return;
      }

     //duplicate key
      if ( err && err.code === 11000 ) {
        res.send('User already exists');
        return;
      }

      res.send(user);
    });
};

exports.findAll = function(req, res) {
    console.log('Find all users');
    User.find(function(err, users) {
      if (err) return console.error(err);
      res.send(users);
    });
};
