var mongoose = require('mongoose');
const config = require('./../config');

// set up mongoose to use promises
mongoose.Promise = global.Promise;

// DB Setup
mongoose.connect(config.database, function(err) {
	if (err) {
		console.log(err);
	} else {
		console.log("Connected to the database");
	}
});

// export mongoose with the above custom settings
module.exports = {
  mongoose
};
