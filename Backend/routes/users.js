/*exports.addUser = function(req, res) {
    var object = req.body;
    console.log('Adding object: ' + JSON.stringify(object));

    db.collection('users', function(err, collection) {
        collection.ensureIndex({email:1},{unique:true});
        collection.insert(object, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
                res.send({'error':err});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));

                // Response to Nessee
                res.send(result[0]);
            }
        });
    });
}*/

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

/*exports.findAll = function(req, res) {
    db.collection('users', function(err, collection) {
        collection.find().toArray(function(err, items) {
            console.log('Success: ' + items);

            res.send(items);
        });
    });
};*/

exports.findAll = function(req, res) {
    console.log('Find all users');
    User.find(function(err, users) {
      if (err) return console.error(err);
      res.send(users);
    });
};
