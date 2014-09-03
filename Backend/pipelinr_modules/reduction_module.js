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

  samplePipeline: function(pipeline, tool) {
  	console.log("Reduction module: sample pipeline");
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
	  	if(!(tool.keys.indexOf(pipeline.datasets[k].key) > -1))
	  		pipeline.datasets[k].values = [];
	  }
  	return pipeline;
  },

  samplingDatasets: function(dataset) {
    console.log("Reduction module: sampling dataset");

    models.Dataset
      .find({}, function (err, datasets) {
        if (err) return res.send(pipelinr_util.handleError(err));
        for(var i = 0; i < datasets.length; i++) {
          if(datasets[i].values.length > 1000 && datasets[i].type === 'int') {
            
            var n = datasets[i].values.length - 1000; // Remove only over 1000 elements
            for(var j = 0; j < n; j++) {
              var valueId = datasets[i].values[Math.floor(Math.random() * datasets[i].values.length)];
              
              models.Value.findOne({_id: valueId}, function(err, value) {
                if(value !== null) value.remove();
              });
            }

          }
        }
    });
  }
};