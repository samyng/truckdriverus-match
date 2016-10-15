const { User } = require('./../models/user');

const authenticate = (req, res, next) => {
  // grab token from request object
  const token = req.header('x-auth');

  User.findByToken(token).then(user => {
    if (!user) {
      return Promise.reject();
    }
    // set req.user to the user that was found
    // also assign token to req object
    req.user = user;
    req.token = token;
    // call next() so the next function runs (this is middleware remember)
    next();
  }).catch((e) => {
    res.status(401).send();
  })
};

module.exports = { authenticate };
