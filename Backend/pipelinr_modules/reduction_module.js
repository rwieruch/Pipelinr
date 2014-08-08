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
  	// TODO:
  	return pipeline;
  },

  selectDatasets: function(pipeline, tool) {
  	console.log("select datasets");
  	//var modifiedPipeline = JSON.parse(JSON.stringify(pipeline));
  	for(var k = 0; k < pipeline.datasets.length; k++) {
	  	if(!(tool.keys.indexOf(pipeline.datasets[k].key) > -1))
	  		pipeline.datasets[k].values = [];
	  }

  	return pipeline;
  }
};