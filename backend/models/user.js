// import mongoose (not custom)
const mongoose = require('mongoose');

//import validator for email validation
const validator = require('validator');

// import helper libraries
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

// create User schema
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minLength: 1,
    trim: true, //removes whitespace before and after text
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }],
  resetPasswordToken: String,
	resetPasswordExpires: Date
});

// user instance methods below ---------->

// overwrite toJSON method so that password and token aren't sent to client
// when a new user is created
UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  // return only _id and email properties to client
  return _.pick(userObject, ['_id', 'email']);
};

// generate json web token after a user is successfully created
UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  // toHexString() converts ObjectID mongodb data type into a string
  var token = jwt.sign({ _id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

  // push new token onto the user's token's array (see user model above)
  user.tokens.push({ access, token });

  // returning the token here so that server.js can use it
  // in a promise chain
  return user.save().then(() => {
    return token;
  });
};

UserSchema.methods.removeToken = function (token) {
  var user = this;
  // pull any token from the user's tokens array that matches
  // the one passed as a parameter to this function
  return user.update({
    $pull: {
      tokens: {
        token: token
      }
    }
  });
};

// user model methods below ---------->

UserSchema.statics.findByToken = function (token) {
  // uppercase User is referring to the model not the instance
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

UserSchema.statics.findByCredentials = function (email, password) {
  var User = this;
  return User.findOne({ email }).then(user => {
    if (!user) return Promise.reject();

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        // bcrypt.compare returns true or false
        // if true, resolve with found user
        if (res) resolve(user);
        // if flase, reject
        reject();
      });
    });
  });
};

UserSchema.pre('save', function (next) {
  var user = this;
  // only run this function if the password is modified
  // avoids rehashing password if a user updates email for instance
  if (user.isModified('password')) {
    // create salt
    bcrypt.genSalt(10, (err, salt) => {
      // combine sale with encrypted user password
      bcrypt.hash(user.password, salt, (err, hash) => {
        // set user's password to hash
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

// set User model
const User = mongoose.model('User', UserSchema);

// export user model
module.exports = { User };
