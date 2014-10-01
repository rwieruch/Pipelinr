var models = require('../models/models.js');
var moment = require('moment');

module.exports = {
  trimPipeline: function(pipeline, tool) {
    console.log("Reduction module: trim pipeline");
    if(tool.begin != "" && tool.end != "") {
	    for(var i = 0; i < pipeline.datasets.length; i++) {
	      for(var j = pipeline.datasets[i].values.length-1; j >= 0; j--){
	        if(pipeline.datasets[i].values[j].timestamp < tool.begin || tool.end < pipeline.datasets[i].values[j].timestamp) {
	          pipeline.datasets[i].values.splice(j,1);
	        }
	      }
	    }
	  }
    return pipeline;
  },

  randomSampling: function(pipeline, tool) {
  	console.log("Reduction module: " + tool.task);
    console.log(tool.rate);
  	if(tool.rate !== 0) {
      for(var i = 0; i < pipeline.datasets.length; i++) {
        if(pipeline.datasets[i].type === 'int') {
          var n = Math.floor((tool.rate/100) * (pipeline.datasets[i].values.length - 1));
          for(var j = 0; j < n; j++) {
            pipeline.datasets[i].values.splice([Math.floor(Math.random() * pipeline.datasets[i].values.length)], 1); 
          }
        }
      }
    }
  	return pipeline;
  },

  intervalSampling: function(pipeline, tool) {
    console.log("Reduction module: " + tool.task);
    console.log(tool.rate);
    if(tool.rate !== 0) {
      for(var i = 0; i < pipeline.datasets.length; i++) {
        if(pipeline.datasets[i].type === 'int' && pipeline.datasets[i].values.length !== 0) {
          var count = 0;
          for(var j = 0; j < pipeline.datasets[i].values.length; j++) {
            count++;
            console.log(count % tool.rate);
            if((count % tool.rate) !== 0)
              pipeline.datasets[i].values.splice(j, 1); 
          }
        }
      }
    }
    return pipeline;
  },

  frequencySampling: function(pipeline, tool) {
    console.log("Reduction module: " + tool.task);
    console.log(moment().format('DD MM YYYY, HH:mm:ss:SSS'));
    //console.log(tool.rate);
    if(tool.rate !== 0) {
      for(var i = 0; i < pipeline.datasets.length; i++) {
        if(pipeline.datasets[i].type === 'int' && pipeline.datasets[i].values.length !== 0) {
          console.log(pipeline.datasets[i].values.length);
          // Seperation in groups on rate
          var beginIntervall = moment(pipeline.datasets[i].values[0].timestamp, 'DD MM YYYY, HH:mm:ss:SSS');
          var endIntervall = moment(beginIntervall, 'DD MM YYYY, HH:mm:ss:SSS').add(tool.rate, 'seconds');
          var group = {};
          for(var j = 0; j < pipeline.datasets[i].values.length; j++) {
            var currentDate = moment(pipeline.datasets[i].values[j].timestamp, 'DD MM YYYY, HH:mm:ss:SSS');
            if(!(currentDate >= beginIntervall && currentDate < endIntervall)) {
              beginIntervall = moment(currentDate, 'DD MM YYYY, HH:mm:ss:SSS');
              endIntervall = moment(currentDate, 'DD MM YYYY, HH:mm:ss:SSS').add(tool.rate, 'seconds');
            }
            if (!group[beginIntervall]) {
              group[beginIntervall] = [];
            } 
            group[beginIntervall].push(pipeline.datasets[i].values[j]);
          }

          // Reduce
          var values = [];
          for(var k in group) {
            var sum = 0;
            var count = 0;
            for(var m in group[k]) {
              sum += +group[k][m].value;
              count++;
            }
            values.push({timestamp: group[k][0].timestamp, value: sum/count});
          }

          // Perm?
          console.log(tool.perm);
          if(tool.perm) {

            for(var j = 0; j < pipeline.datasets[i].values.length; j++) {

              // Update old values, remove rest
              if(typeof values[j] === 'undefined') {
                models.Value.remove({ _id: pipeline.datasets[i].values[j]._id}).exec();
              } else {
                models.Value.findOneAndUpdate({ _id: pipeline.datasets[i].values[j]._id}, { timestamp: values[j].timestamp, value: values[j].value }, function(err, value) {
                  if (err) console.log(err);
                });
              }

            }

          }
          console.log(values.length);
          pipeline.datasets[i].values = values;

        }
      }
    }
    console.log(moment().format('DD MM YYYY, HH:mm:ss:SSS'));
    return pipeline;
  },

  selectDatasets: function(pipeline, tool) {
  	console.log("Reduction module: select datasets");
  	for(var k = 0; k < pipeline.datasets.length; k++) {
      for(var i = 0; i < tool.keys.length; i++) {
  	  	if(tool.keys[i].name === pipeline.datasets[k].key) {
          if(tool.keys[i].checked === false)
  	  		  pipeline.datasets[k].values = [];
        }
      }
	  }
  	return pipeline;
  },

  samplingDatasets: function() {
    console.log("Reduction module: sampling dataset");

    models.Value  
    .find({})
    .populate('_dataset', 'type')
    .exec(function(err, values) {
      if (err) return res.send(pipelinr_util.handleError(err));
      
      // Group values in dataset arrays to evaluate their length
      var group = {};
      values.map(function (value) {
        if(value._dataset.type === 'int') {
          if (!group[value._dataset]) {
            group[value._dataset] = [];
          } 
          group[value._dataset].push(value);
        }
      });
      
      for(var i in group) {
        if(group[i].length > 1000) {
          var n = group[i].length - 1000; // Remove only over 1000 elements
          for(var j = 0; j < n; j++) {
            var valueId = group[i][Math.floor(Math.random() * group[i].length)];           
            models.Value.find({_id: valueId}).remove().exec();
          }
        }
      }

    });    
  }
};