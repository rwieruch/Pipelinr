//var jwt = require('jwt-simple');
//var validateUser = require('../routes/auth').validateUser;
var models = require('../models/models.js'); 
 
module.exports = function(req, res, next) {
 
  console.log('Authorize.');
  var token = req.headers.token;

  // Find session
  models.Session.findOne({ token: token }, function(err, session) {
    if (err|| !session) { res.send(401); return; }
    console.log('Session found.');

    // TODO: check if date expired

    models.User.findOne({ email: session.email }, function(err, user) {
      if (err|| !user) { res.send(401); return; }
      console.log('User found.');
      req.user = user;
      next(); // To move to next middleware
    });
  });
 
  /*var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
  var key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];
 
  if (token || key) {
    try {
      var decoded = jwt.decode(token, require('../config/secret.js')());
 
      if (decoded.exp <= Date.now()) {
        res.status(400);
        res.json({
          "status": 400,
          "message": "Token Expired"
        });
        return;
      }
 
      // Authorize the user to see if s/he can access our resources
 
      var dbUser = validateUser(key); // The key would be the logged in user's username
      if (dbUser) {
 
 
        if ((req.url.indexOf('admin') >= 0 && dbUser.role == 'admin') || (req.url.indexOf('admin') < 0 && req.url.indexOf('/api/v1/') >= 0)) {
          next(); // To move to next middleware
        } else {
          res.status(403);
          res.json({
            "status": 403,
            "message": "Not Authorized"
          });
          return;
        }
      } else {
        // No user with this name exists, respond back with a 401
        res.status(401);
        res.json({
          "status": 401,
          "message": "Invalid User"
        });
        return;
      }
 
    } catch (err) {
      res.status(500);
      res.json({
        "status": 500,
        "message": "Oops something went wrong",
        "error": err
      });
    }
  } else {
    res.status(401);
    res.json({
      "status": 401,
      "message": "Invalid Token or Key"
    });
    return;
  }*/
};