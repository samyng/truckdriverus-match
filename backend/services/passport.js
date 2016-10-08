const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

// Create local strategy for logging in a user with an existing email and password

const localOptions = { usernameField: 'email' }; //the passwordField is automatically searched for by passport in the request body, here we only point out usernameField as being attached to req.body.email

const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
	User.findOne({ email: email }, function(err, user) {

		if (err) { return done(err); } //Error in system

		if (!user) { return done(null, false); } //Could not find a user based on the given email and password

		// compare password - is password in DB equal to password supplied at login? 
		//compares encrypted password in database by first encrypting the password supplied with login (plus salting it).

		user.comparePassword(password, function(err, isMatch) {

			if (err) { return done(err); } //error in system

			if (!isMatch) { return done(null, false); } //isMatch is false

			return done(null, user); //found user because isMatch is true ***IMPORTANT: "done" returns the existing user in the req object - req.user which will be used in the signIn strategy

		});
		
	});
});



// Setup options for JWT Strategy that authorizes a user to hit protected routes

const jwtOptions = {
	jwtFromRequest: ExtractJwt.fromHeader('authorization'), //Tells jwtStrategy where to look for the jwt on the incoming request object
	secretOrKey: config.secret //This is the secret string for decoding all JWT's
};

// Create JWT Strategy

const jwtLogin =  new JwtStrategy(jwtOptions, function(payload, done) {
	// See if the user ID in the payload exists in our database
	// If it does, call 'done' with that user
	// otherwise, call done without a user object

	User.findById(payload.sub, function(err, user) {

		if (err) { return done(err, false); } // error occured, no user

		if (user) {
			done(null, user); // no error and found user
		} else {
			done(null, false); //no error but didn't find user
		}

	});

	
});

// Tell Passport to use this jwtLogin Strategy
passport.use(jwtLogin);
passport.use(localLogin);