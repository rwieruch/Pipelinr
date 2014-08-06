// API for Pipelinr
exports.findById = function(moment) {
    return function(req, res) {
        var token = req.headers.token;
        var id = req.params.id;

        var begin = req.query.begin;
        var end = req.query.end;
        var keys = req.query.keys;

        console.log('find pipeline: ' + id);

        // Find session
        //Session.findOne({ token: token }, function(err, session) {
        //    if (err|| !session) { res.send(401); return; }

            Testcase.findOne({ origin_id: id }, function(err, testcase) {
              if (err || !testcase) { res.send(404); return; }

              console.log(begin + " " + end);
              console.log(keys);

              if(begin == "" && end == "") {
                  // TODO: Last hour, later this is done by setting, TODO: last hour from last value
                  var oneHourAgo = moment().subtract('hours', 600).format('DD MM YYYY, HH:mm:ss');
                  for(var i = 0; i < testcase.datasets.length; i++) {
                    for(var j = testcase.datasets[i].values.length-1; j >= 0; j--){
                        if(testcase.datasets[i].values[j].timestamp > oneHourAgo) {
                            testcase.datasets[i].values.splice(j,1);
                        }
                    }
                  }
              } else {
                for(var i = 0; i < testcase.datasets.length; i++) {
                    for(var j = testcase.datasets[i].values.length-1; j >= 0; j--){
                        if(testcase.datasets[i].values[j].timestamp < begin || end < testcase.datasets[i].values[j].timestamp) {
                            testcase.datasets[i].values.splice(j,1);
                        }
                    }
                }
              }

              if(keys != "") {
                var i = testcase.datasets.length;
                while(i--)
                {
                  if(testcase.datasets[i].type == "int") {
                    var isIn = false;
                    for(var j in keys) {
                      console.log(keys[j]);
                      if(testcase.datasets[i].key == keys[j]) 
                        isIn = true;
                    }
                    if(!isIn) {
                      console.log(testcase.datasets[i].key);
                      testcase.datasets[i].values = null;
                    }
                  }
                }
              }

              res.send(testcase);
            });

        //});
    };
};

exports.findAll = function(req, res) {
    var token = req.headers.token;
    console.log('Find all testcases');

    // Find session
    //Session.findOne({ token: token }, function(err, session) {
    //  if (err|| !session) { res.send(401); return; }

        Testcase.find(function(err, testcases) {
          if (err) { res.send(404); return; }

          for(var j in testcases) {
              for(var i in testcases[j].datasets) {
                testcases[j].datasets[i].values = null;
              }
          }

          res.send(testcases);
        });
    //});
};

exports.addObject = function(io) {
    return function(req, res) {
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

          /*var cloneTestcase = JSON.parse(JSON.stringify(testcase));
          for(var i in cloneTestcase.datasets) {
            cloneTestcase.datasets[i].values = null;
          }*/
          io.sockets.in('flow').emit('newPipeline', testcase);

          res.send(200, {pipeline: testcase});
        });
    };
};

exports.updateObject = function(io) {
    return function(req, res) {
        var id = req.params.id;
        var object = req.body;

        console.log('Updating object: ' + id);
        console.log(JSON.stringify(object));

        Testcase.findOne({ origin_id: id }, function(err, testcase) {
          if (err || !testcase) { res.send(404); return; }
          
          var isIn = false;
          // Change object
          for(var i in testcase.datasets) {
            if(testcase.datasets[i].key == object.key) {
              testcase.datasets[i].values.push({ value: object.value, timestamp: object.timestamp, level: object.level});
              isIn = true;
            }
          }

          // TODO remove this, when add dataset method is available
          // Create new dataset, when object.key isn't already there. Client needs to specify object.type for the new dataset.
          if(!isIn) {
            testcase.datasets.push({ key: object.key, type: object.type});

            // Send new dataset to overview
            var cloneTestcase = JSON.parse(JSON.stringify(testcase));
            for(var i in cloneTestcase.datasets) {
                cloneTestcase.datasets[i].values = null;
            }
            io.sockets.in('flow').emit('newDataset', cloneTestcase);
          }

          // Update
          /*
          Testcase.update({origin_id: id}, { $set : { datasets : testcase.datasets }}, function(err) { 
            if(err) { console.log(err); res.send(404); } 
            
            io.sockets.in('flow').emit('updatedObject', JSON.parse(JSON.stringify({ id: id, key: object.key, value: object.value, timestamp: object.timestamp, type: object.type, level: object.level })));
            
            res.send(200, {pipeline: testcase}); 
          });
          */

          var newValue = {};
          newValue.value = object.value;
          newValue.timestamp = object.timestamp;
          newValue.level = object.level;
          console.log(newValue);

          Testcase.update({origin_id: id}, { $push : { values : newValue }}, function(err) { 
            if(err) { console.log(err); res.send(404); } 
            
            io.sockets.in('flow').emit('updatedObject', JSON.parse(JSON.stringify({ id: id, key: object.key, value: object.value, timestamp: object.timestamp, type: object.type, level: object.level })));
            
            res.send(200, {pipeline: testcase}); 
          });
      });
    }
}