var mongoose = require('mongoose');

// set up mongoose to use promises
mongoose.Promise = global.Promise;

// DB Setup
mongoose.connect(process.env.MONGODB_URI, function(err) {
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
