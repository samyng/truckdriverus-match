const mongoose = require('mongoose');
const Schema = mongoose.Schema; //Schema is used to communicate with mongoose about the specific fields a user will have
const bcrypt = require('bcrypt-nodejs');

// Define user model

const userSchema = new Schema({
	email: { type: String, unique: true, lowercase: true }, //every email must be unique and will be converted to lowercase before being saved
	password: String
});

// On Save Hook, encrypt password

// pre = Before saving a model, run this function
userSchema.pre('save', function(next) {

	const user = this; //accessing the specific user model that is about to be saved

	// generate a salt then run callback
	bcrypt.genSalt(10, function(err, salt) {

		if (err) { return next(err); }

		// hash (encrypt) our password using the salt
		bcrypt.hash(user.password, salt, null, function(err, hash) {

			if (err) { return next(err); }

			// overwrite plain text password with encrypted password
			user.password = hash;
			next();

		});

	});

});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {

		if (err) { return callback(err); }

		callback(null, isMatch); //if the passwords are the same, isMatch will be true, otherwise false

	});
}

// Create the model class

const ModelClass = mongoose.model('user', userSchema); //loads the userSchema into mongoose that will be applied to all users and creates the user class.

// Export the model

module.exports = ModelClass;