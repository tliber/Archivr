var User = require('./api/user/userModel');
var config = require('./config/environment');
var jwt = require('express-jwt');

module.exports = function applicationRouter(app) {

  /**
   * middleware for handling username param
   * this is probably the place check if
   * this is a valid username and also get access to the user id
   */
  app.param('username', function(req, res, next, username) {
    // find the user
    User.findOne({ username: username }, function(err, user) {
      // there was an error
      if (err) return res.send(500);
      // the user doesn't exist
      if (!user) return res.send(404);

      if (user) {
        // the user exists, attach their ID to the request
        req.foundUser = user;
        // continue
        return next();
      } else {
        return next(new Error('Unable to find user.'));
      }

    });
  });

  // mounts JWT checker to all routes prefixed with /api
  // the idea is this should deserialize the JWT and attach
  // the user to req.user when the user is authenticated
  app.use('/api', jwt({
    secret: config.jwtTokenSecret,
    credentialsRequired: false,
    getToken: function fromHeaderOrQuerystring(req) {
      console.log(req.headers);
      // if(req.body && req.headers['x-access-token']){
      //   // handle posts
      //   return req.headers['x-access-token'];
      // } else if(req.query && req.query['x-access-token']){
      //   // handle GETs
      //   return req.headers['x-access-token'];
      // }
      // return null;

      console.log(req.headers);
    //   if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    //         return req.headers.authorization.split(' ')[1];
    //     } else if (req.query && req.query.token) {
    //       return req.query.token;
    //     }
    //     return null;
    //   }
    }
  }));

  // authentication related routes
  app.use('/api/auth', require('./api/auth'));

  // mount user and screenshot routers to /api
  app.use('/api/user', require('./api/user'));

  /**
   * screenshot routes are structured
   * /user/:id/screenshot
   * and /user/:id/screenshot/:id
   */
  app.use('/api/user', require('./api/screenshot'));

  /**
   * catch all other routes and send back to
   * index for angular to handle
   */
  app.get('/*', function(req, res, next) {
    res.render('index');
  });

};
