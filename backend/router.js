//req is the object containing data about the incoming http request
//res is the response that will be sent back to whoever made the request);

const Authentication = require('./controllers/authentication');
const passportService = require('./services/passport');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

// config settings for sendgrid account
const config = require('./config');
const async = require('async');
// const parallel = require('async/parallel');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

module.exports = function (app) {
	app.post('/signin', requireSignin, Authentication.signin); //Before the user can actually sign in, the passwords are compared in the local stratgey requireSignin

	app.post('/signup', Authentication.signup);

	// forgot password route, assigns user a reset token and sends email
	// email will contain a link to the '/reset/:token' route below
	app.post('/forgotPassword', function(req, res, next) {

		var queryParams = req.query;

		async.waterfall([
			// generate reset token
			function(done) {
				crypto.randomBytes(20, function(err, buf) {
        	var token = buf.toString('hex');
        	done(err, token);
      	});
			},
			function(token, done) {
				// search for user with the given email
				User.findOne({ email: req.body.email }, function(err, user) {
					// check to see if the user exists
					if (!user) {
						// user doesn't exist in database
						res.status(404).json("No user with that email exists");
					}
					// user exists, assign token with expiration date
					user.resetPasswordToken = token;
					user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

					// save the user model with the newly added
					// token and expiration date
					user.save(function(err) {
						done(err, token, user);
					});
				});
    	},
			function(token, user, done) {

			    var smtpTransport = nodemailer.createTransport('SMTP', {
			      service: 'SendGrid',
			      auth: {
			        user: config.sendgridUser,
			        pass: config.sendgridPassword
			      }
			    });

			    var mailOptions = {
			      to: user.email,
			      from: 'mjuice@uga.edu',
			      subject: 'Password Reset',
			      text: `Hello,
									 We received a request to reset your password.
									 \n
									 To start the process, please click the following link:
									 http://${req.headers.host}/forgot/${token}
									 \n
									 If the above link doesn’t take you to our password reset page,
									 copy and paste the URL into the search bar of a new browser window.
									 \n
									 The URL will expire in 1 hour for security reasons.
									 If you didn’t make this request, simply ignore this message.`

			    };

					// send the email using the mailOptions object defined above
			  	smtpTransport.sendMail(mailOptions, function(err) {
			    	done(err, 'done');
			  	});
	    	}],
				function(err) {
					// handle error
					if (err) return next(err);
					res.status(200).json("Email sent");
				});
		}); // end POST route '/forgotPassword'


} // end module.exports
