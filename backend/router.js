//import user model
const { User } = require('./models/user');

const _ = require('lodash');
const nodemailer = require('nodemailer');
const crypto = require('crypto');


// import custom middleware
const { authenticate } = require('./middleware/authenticate');

module.exports = function (app) {
	// create a new user
	app.post('/users/signup', (req, res) => {
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
	    res.status(400).send(e);
	  });
	});

	// login a user, searches by email, compares hashed password
	// returns jwt on success
	app.post('/users/login', (req, res) => {
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
	app.delete('/users/logout', authenticate, (req, res) => {
	  // authenticate middleware returns the user on the request object
	  req.user.removeToken(req.token).then(() => {
	    res.status(200).send();
	  }, () => {
	    res.status(400).send();
	  });
	});

	// authenticate middleware searches for user via jwt
	// returns user and token on request object
	app.get('/users/me', authenticate, (req, res) => {
	  res.send(req.user);
	});

	// sends user a reset token and url to follow for resetting password
	app.post('/forgotPassword', (req, res, next) => {
		return new Promise((resolve, reject) => {
			crypto.randomBytes(20, function(err, buf) {
				if (err) { return reject(err); }

      	var token = buf.toString('hex');
      	resolve(token);
    	});
		})
		.then(token => {
			return new Promise((resolve, reject) => {
				User.findOne({ email: req.body.email }, function(err, user) {

					// if no user is returned, throw 404
					if (!user) { return reject(404); }

					// user exists, assign token with expiration date
			  	user.resetPasswordToken = token;
				 	user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

					// save user with new token property
					user.save(err => {
						if (err) { return reject(err); }

						const userAndToken = {
							user,
							token
						};
						// pass on user and token
						resolve(userAndToken);
					});
				});
			});
		})
		.then(userAndToken => {
			return new Promise((resolve, reject) => {
				var smtpTransport = nodemailer.createTransport('SMTP',
					{
			      service: 'SendGrid',
			      auth: {
			        user: process.env.SEND_USER,
			        pass: process.env.SEND_PASS
			    }
			  });

		    var mailOptions = {
		      to: userAndToken.user.email,
		      from: 'mjuice@uga.edu',
		      subject: 'Password Reset',
		      text: `Hello,
								 We received a request to reset your password.
								 \n
								 To start the process, please click the following link:
								 http://${req.headers.host}/reset-password/${userAndToken.token}
								 \n
								 If the above link doesn’t take you to our password reset page,
								 copy and paste the URL into the search bar of a new browser window.
								 \n
								 The URL will expire in 1 hour for security reasons.
								 If you didn’t make this request, simply ignore this message.`

		    };

				// send the email using the mailOptions object defined above
		  	smtpTransport.sendMail(mailOptions, function(err) {
					if (err) { return reject(err); }
		    	resolve();
		  	});
			});
		})
		.then(() => { res.status(200).send(); })
		.catch(err => {
			//check if the error is the one from the DB where the user was not found
      if(err == 404) {
        return res.status(404).send();
      }
      return res.status(500).send(err);
		});
	}); // end POST '/forgotPassword'


	// reset a user's password after they have received the token in an email
	app.post('/resetPassword/:token', (req, res, next) => {
		return new Promise((resolve, reject) => {

			User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
				if (!user) {
					return reject(404);
				}

				user.password = req.body.password;
				user.resetPasswordToken = undefined;
				user.resetPasswordExpires = undefined;

				user.save(function(err) {
					if (err) { return reject(err); }
					resolve(user);
				});
			});
		})
		.then(user => {
			return new Promise((resolve, reject) => {
				var smtpTransport = nodemailer.createTransport('SMTP',
					{
			      service: 'SendGrid',
			      auth: {
							user: process.env.SEND_USER,
							pass: process.env.SEND_PASS
			    }
			  });

		    var mailOptions = {
		      to: user.email,
		      from: 'mjuice@uga.edu',
		      subject: 'Password Successfully Reset',
		      text: 'This is confirmation that your password has been reset.'

		    };

				// send the email using the mailOptions object defined above
		  	smtpTransport.sendMail(mailOptions, function(err) {
					if (err) { return reject(err); }
		    	resolve();
		  	});
	    });
		})
		.then(() => { res.status(200).send(); })
		.catch(err => {
			//check if the error is the one from the DB where the user was not found
      if(err == 404) {
        return res.status(404).send();
      }
      return res.status(500).send(err);
		});
	}); // end POST '/resetPassword/:token'

} // end module.exports
