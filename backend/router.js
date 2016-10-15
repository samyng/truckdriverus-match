//import user model
const { User } = require('./models/user');

// config settings for sendgrid account
const config = require('./config');
const _ = require('lodash');
const waterfall = require('async/waterfall');
// const parallel = require('async/parallel');
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

	// login a user
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

	// logout a user
	app.delete('/users/logout', authenticate, (req, res) => {
	  // authenticate middleware returns the user on the request object
	  req.user.removeToken(req.token).then(() => {
	    res.status(200).send();
	  }, () => {
	    res.status(400).send();
	  });
	});


	app.get('/users/me', authenticate, (req, res) => {
	  res.send(req.user);
	});

	// forgot password route, assigns user a reset token and sends email
	// email will contain a link to the '/reset/:token' route below
	// app.post('/forgotPassword', function(req, res, next) {
	//
	// 	waterfall([
	// 		// generate reset token
	// 		function(done) {
	// 			crypto.randomBytes(20, function(err, buf) {
  //       	var token = buf.toString('hex');
  //       	done(err, token);
  //     	});
	// 		},
	// 		function(token, done) {
	// 			// search for user with the given email
	// 			User.findOne({ email: req.body.email }, function(err, user) {
	// 				// check to see if the user exists
	// 				if (!user) {
	// 					// user doesn't exist in database
	// 					return res.status(404).send();
	// 				}
	// 				// user exists, assign token with expiration date
	// 				user.resetPasswordToken = token;
	// 				user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
	//
	// 				// save the user model with the newly added
	// 				// token and expiration date
	// 				user.save(function(err) {
	// 					done(err, token, user);
	// 				});
	// 			});
  //   	},
	// 		function(token, user, done) {
	// 		    var smtpTransport = nodemailer.createTransport('SMTP', {
	// 		      service: 'SendGrid',
	// 		      auth: {
	// 		        user: config.sendgridUser,
	// 		        pass: config.sendgridPassword
	// 		      }
	// 		    });
	//
	// 		    var mailOptions = {
	// 		      to: user.email,
	// 		      from: 'mjuice@uga.edu',
	// 		      subject: 'Password Reset',
	// 		      text: `Hello,
	// 								 We received a request to reset your password.
	// 								 \n
	// 								 To start the process, please click the following link:
	// 								 http://${req.headers.host}/reset-password/${token}
	// 								 \n
	// 								 If the above link doesn’t take you to our password reset page,
	// 								 copy and paste the URL into the search bar of a new browser window.
	// 								 \n
	// 								 The URL will expire in 1 hour for security reasons.
	// 								 If you didn’t make this request, simply ignore this message.`
	//
	// 		    };
	//
	// 				// send the email using the mailOptions object defined above
	// 		  	smtpTransport.sendMail(mailOptions, function(err) {
	// 		    	done(err, 'done');
	// 		  	});
	//     	}],
	// 			function(err) {
	// 				// handle error
	// 				if (err) return next(err);
	// 				res.status(200).send();
	// 			});
	// 	}); // end POST route '/forgotPassword'

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
						resolve({userAndToken});
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
			        user: config.sendgridUser,
			        pass: config.sendgridPassword
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
			console.log(err);
      return res.status(500).send(err);
		});
	}); // end POST '/forgotPassword'

		// POST resetPassword route actually changes the user's password in the database
		app.post('/resetPassword/:token', function(req, res) {

		  waterfall([
		    function(done) {

					User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
		        if (!user) {
							res.status(401).send();
		        }

		        user.password = req.body.password;
		        user.resetPasswordToken = undefined;
		        user.resetPasswordExpires = undefined;

		        user.save(function(err) {
		          if (err) { next(err); }
							done(err, user);
		        });
		      });

		    },
		    function(user, done) {

		      var smtpTransport = nodemailer.createTransport('SMTP', {
		        service: 'SendGrid',
		        auth: {
		          user: config.sendGridUser,
		          pass: config.sendGridPass
		        }
		      });
		      var mailOptions = {
		        to: user.email,
		        from: 'mjuice@uga.edu',
		        subject: 'Password Changed',
		        text: `Hello,\n
									 This is a confirmation that the password for your account, ${user.email},
									 has just been changed.`
		      };
		      smtpTransport.sendMail(mailOptions, function(err) {
		        done(err);
		      });
		    }
		  ], function(err) {
		    res.status(200).json("Your password has been successfully reset!");
		  });
		});


} // end module.exports
