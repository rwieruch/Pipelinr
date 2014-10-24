var models = require('../models/models.js'); 
var sampleCreator = require('../models/sample-creator.js'); 

exports.addUser = function(req, res) {
    var object = req.body;
    console.log('add user: ' + JSON.stringify(object));

    var user = new models.User({
          email: object.email
        , username: object.name
        , password: object.password
    });

    user.save(function(err, user) {

      if ( err && err.code !== 11000 ) { res.send(404); return; }

      // Duplicate key
      if ( err && err.code === 11000 ) { res.status(409); res.send({statusText:'Username or email already taken.'}); return; }

      // Create sample in database
      sampleCreator.createSample(user, models);

      res.status(200);
      res.send({statusText:'Your registration was successful.'});
    });
};

exports.findAll = function(req, res) {
    console.log('Find all users');
    models.User.find(function(err, users) {
      if (err) { res.send(404); return; }
      res.send(users);
    });
};
