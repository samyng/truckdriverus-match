const jwt = require('jwt-simple');
const User = require('../models/user'); //This will contain the user class, so it contains all instances of user
const config = require('../config');


function tokenForUser(user) {
	const timestamp = new Date().getTime();
	return jwt.encode({ sub: user.id, iat: timestamp }, config.secret); //The first argument is the info we want to encode and the second is the secret string for decryption
}													    // sub = subject, who is the subject of the token? The user, iat = issued at

exports.signin =  function(req, res, next) {
	//user has already had email and password auth'ed
	//Time to assign a jwt (log them in)
	res.send({ token: tokenForUser(req.user) });
}

exports.signup = function(req, res, next) {

	const email = req.body.email;
	const password = req.body.password;

	//If the user forgets to provide an email or as password

	if (!email || !password) {
		return res.status(422).send({ error: 'You must provide both email and password' });
	}

	//See if a user with the given email exists, no duplicates

	User.findOne({ email: email }, function (err, existingUser) {
		if (err) {return next(err); }

		//If a user with email does exist, return an error

		if (existingUser) {
			return res.status(422).send({ error: 'Email is already in use' });
		}

		//If a user with email does NOT exist, create and save user record

		const user = new User({ //This creates the new user but does not save it to the DB
			email: email,
			password: password
		});

		user.save(function(err) {//saves new user to the database
			if (err) { return next(err); }

			//Response returns the a jwt to the user (contains user id, and special string for decryption purposes)
			res.json({ token: tokenForUser(user) }); 
		}); 

		

	});

	

	

	
}