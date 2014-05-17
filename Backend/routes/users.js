exports.addUser = function(req, res) {
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
}

exports.findAll = function(req, res) {
    db.collection('users', function(err, collection) {
        collection.find().toArray(function(err, items) {
            console.log('Success: ' + items);

            res.send(items);
        });
    });
};
