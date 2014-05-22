// API for Pipelinr

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('find pipeline: ' + id);

    // Get registered user
    Testcase.findOne({ origin_id: id }, function(err, testcase) {
      if (err || !testcase) { res.send(404); return; }
      res.send(testcase);
    });
};

/*exports.findAll = function(req, res) {
    db.collection('testcases', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};*/

exports.findAll = function(req, res) {
    console.log('Find all testcases');
    Testcase.find(function(err, testcases) {
      if (err) { res.send(404); return; }
      res.send(testcases);
    });
};

// API for nessee Core

/*exports.addObject = function(io) {
    return function(req, res) {
        var object = req.body;
        console.log('Adding object: ' + JSON.stringify(object));
        db.collection('testcases', function(err, collection) {
            collection.insert(object, {safe:true}, function(err, result) {
                if (err) {
                    res.send({'error':'An error has occurred'});
                } else {
                    console.log('Success: ' + JSON.stringify(result[0]));

                    // Response to nessee
                    res.send(result[0]);

                    // Notify client via socket
                    io.sockets.in('flow').emit('connectionStatus', 'new object: ' + object.name);
                    io.sockets.in('flow').emit('addedObject', object);
                    //io.socket.broadcast.to('flow').emit('connectionStatus', 'new object');
                    //io.sockets.emit('connectionStatus', 'new object');
                    //io.socket.broadcast.emit('connectionStatus', 'new object');
                }
            });
        });
    }
}*/

exports.addObject = function(req, res) {
    var object = req.body;
    console.log('add testcase: ' + JSON.stringify(object));

    var testcase = new Testcase({
          name: object.name
        , origin_id: object.origin_id
        , datasets: []
    });

    testcase.save(function(err, testcase) {

      if ( err && err.code !== 11000 ) { res.send(404); return; }

     // Duplicate key
      if ( err && err.code === 11000 ) { res.send(409); return; }

      res.send(200);
    });
};

/*exports.updateObject = function(io) {
    return function(req, res) {
        var id = req.params.id;
        var object = req.body;

        console.log('Updating object: ' + id);
        console.log(JSON.stringify(object));

        // Find object
        db.collection('testcases', function(err, collection) {
            collection.findOne({'_id':new ObjectID(id)}, function(err, item) {
                var isIn = false;
                // Change object
                for(var i in item.datasets) {
                  if(item.datasets[i].key == object.key) {
                    item.datasets[i].values.push({ value: object.value, timestamp: object.timestamp, level: object.level});
                    isIn = true;
                  }
                }

                // Create new dataset, when object.key isn't already there. Client needs to specify object.type for the new dataset.
                if(!isIn) {
                    var values = new Array();
                    values.push({ value: object.value, timestamp: object.timestamp, level: object.level });

                    item.datasets.push(JSON.parse(JSON.stringify({ type: object.type, key: object.key, values: values})));
                }

                // Update object
                db.collection('testcases', function(err, collection) {
                    collection.update({'_id':new ObjectID(id)}, item, {safe:true}, function(err, result) {
                        if (err) {
                            console.log('Error updating object: ' + err);

                            res.send({'error':'An error has occurred'});
                        } else {
                            console.log('Success:');

                            //Notify client via socket
                            io.sockets.in('flow').emit('connectionStatus', 'updated object: ' + item.name);
                            //io.sockets.in('flow').emit('updatedObject', item);
                            io.sockets.in('flow').emit('updatedObject', JSON.parse(JSON.stringify({ id: id, key: object.key, value: object.value, timestamp: object.timestamp, type: object.type, level: object.level })));

                            // Response to nessee
                            res.send(item);
                        }
                    });
                });

            });
        });
    }
}*/