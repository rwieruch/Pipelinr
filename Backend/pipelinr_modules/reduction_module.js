var models = require('../models/models.js');

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

    /*models.Dataset
      .find({}, function (err, datasets) {
        if (err) return res.send(pipelinr_util.handleError(err));
        for(var i = 0; i < datasets.length; i++) {
          if(datasets[i].values.length > 1000 && datasets[i].type === 'int') {
            
            console.log(datasets[i].values.length);

            var n = datasets[i].values.length - 1000; // Remove only over 1000 elements
            for(var j = 0; j < n; j++) {
              var valueId = datasets[i].values[Math.floor(Math.random() * datasets[i].values.length)];
              
              models.Value.findOne({_id: valueId}, function(err, value) {
                if(value !== null) value.remove();
              });
            }

          }
        }
    });*/

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