module.exports = {
  trimPipeline: function(pipeline, tool) {
    console.log("trim pipeline");
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
  	console.log("sample pipeline");
    console.log(tool.rate);
  	if(tool.rate !== 0) {
      for(var i = 0; i < pipeline.datasets.length; i++) {
        /*for(var j = pipeline.datasets[i].values.length-1; j >= 0; j--){
          var rnd = Math.floor((Math.random() * 100) + 1);
          if(rnd < tool.rate)
            pipeline.datasets[i].values.splice(j,1);
        }*/
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
  	console.log("select datasets");
  	for(var k = 0; k < pipeline.datasets.length; k++) {
	  	if(!(tool.keys.indexOf(pipeline.datasets[k].key) > -1))
	  		pipeline.datasets[k].values = [];
	  }
  	return pipeline;
  }
};