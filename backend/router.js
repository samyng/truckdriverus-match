//import user model
const { User } = require('./models/user');
const bodyParser = require('body-parser');
const _ = require('lodash');

// import custom middleware
const { authenticate } = require('./middleware/authenticate');

module.exports = function (app) {
	// create a new user
	app.post('/users/signup', bodyParser.json({ type: '*/*' }), (req, res) => {
	  // pull only the email and password properties from the
	  // request body
	  const body = _.pick(req.body, ['email', 'password']);

	  // create a new user with the body variable above
	  const user = new User(body);

	  // save the new user
	  user.save().then(() => {
	    // generate auth token
	    // generateAuthToken returns the token
	    return user.generateAuthToken();
	  }).then(token => {
	    // send user to client with token in the header
	    // The 'x-' prefix signifies a custom http header
	    res.header('x-auth', token).send(user);
	  }).catch(e => {
      console.log(e);
	    res.status(400).send(e);
	  });
	});

	// login a user, searches by email, compares hashed password
	// returns jwt on success
	app.post('/users/login', bodyParser.json({ type: '*/*' }), (req, res) => {
	  var body = _.pick(req.body, ['email', 'password']);

	  User.findByCredentials(body.email, body.password).then(user => {
	    return user.generateAuthToken().then(token => {
	      res.header('x-auth', token).send(user);
	    });
	  }).catch(e => {
	    res.status(400).send();
	  });
	});

	// logout a user by deleting jwt from their user instance
	app.delete('/users/logout', bodyParser.json({ type: '*/*' }), authenticate, (req, res) => {
	  // authenticate middleware returns the user on the request object
	  req.user.removeToken(req.token).then(() => {
	    res.status(200).send();
	  }, () => {
	    res.status(400).send();
	  });
	});

	// authenticate middleware searches for user via jwt
	// returns user and token on request object
	app.get('/users/me', bodyParser.json({ type: '*/*' }), authenticate, (req, res) => {
	  res.send(req.user);
	});

} // end module.exports
