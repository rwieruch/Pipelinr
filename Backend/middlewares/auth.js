var models = require('../models/models.js'); 
var moment = require('moment');
 
module.exports = function(req, res, next) {
 
  console.log('Authorize.');
  var token = req.headers.token;

  // Find session
  models.Session.findOne({ token: token }, function(err, session) {
    if (err|| !session) { res.status(401); res.send('Invalid Token'); return; }
    console.log('Session found.');

    // Check expired
    if(moment(session.timestamp).add(7,'day').format('DD.MM.YYYY, HH:mm') <= moment().format('DD.MM.YYYY, HH:mm')) {
      console.log('Token expired.');
      res.status(400);
      res.send('Token Expired');
      return;
    }

    // Get user
    models.User.findOne({ email: session.email }, function(err, user) {
      if (err|| !user) { res.status(401); res.send('Invalid User'); return; }
      console.log('User found.');
      req.user = user;
      next(); // To move to next middleware
    });
  });
};