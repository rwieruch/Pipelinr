module.exports = {
  trimPipeline: function(pipeline, tool) {
    /*for(var i = 0; i < pipeline.datasets.length; i++) {
      for(var j = pipeline.datasets[i].values.length-1; j >= 0; j--){
        if(pipeline.datasets[i].values[j].timestamp < tool.begin || tool.end < pipeline.datasets[i].values[j].timestamp) {
          pipeline.datasets[i].values.splice(j,1);
        }
      }
    }*/
    console.log("trim pipeline");
    return pipeline
  },

  samplePipeline: function(pipeline, tool) {
  	console.log("sample pipeline");
  	return pipeline
  },

  selectDatasets: function(pipeline, tool) {
  	console.log("select datasets");
  	return pipeline
  }
};