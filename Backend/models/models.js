var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  email: {
    type:String,
    required: true,
    unique: true
  },
  username: {
    type:String,
    required: true
  },
  password: {
    type:String,
    required: true
  }
});

var sessionSchema = new mongoose.Schema({
  email: {
    type:String,
    required: true
  },
  token: {
    type:String,
    required: true
  },
  timestamp: {
    type:Date,
    required: true
  }
});

var pipelineSchema = new mongoose.Schema({
  name: String,
  origin_id: String,
  datasets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dataset' }]
});

var datasetSchema = new mongoose.Schema({
  _pipeline: {type: mongoose.Schema.Types.ObjectId, ref: 'Pipeline'},
  key: String,
  type: String,
  values: []
  //values: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Value' }]
});

var valueSchema = new mongoose.Schema({
  _dataset: {type: mongoose.Schema.Types.ObjectId, ref: 'Dataset'},
  value: String,
  timestamp: String,
  level: String
});

var User = mongoose.model('User', userSchema);
var Session = mongoose.model('Session', sessionSchema);
var Pipeline = mongoose.model('Pipeline', pipelineSchema);
var Dataset = mongoose.model('Dataset', datasetSchema);
var Value = mongoose.model('Value', valueSchema);

mongoose.connect('mongodb://localhost/pipelinr');

exports.User = User;
exports.Session = Session;
exports.Pipeline = Pipeline;
exports.Dataset = Dataset;
exports.Value = Value;

exports.valueSchema = valueSchema;
exports.datasetSchema = datasetSchema;
exports.pipelineSchema = pipelineSchema;
