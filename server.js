//Main starting point of the application

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const router = require('./backend/router');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./backend/config');
const path = require('path');
const http = require('http');

// DB Setup

mongoose.connect(config.database, function(err) {
	if (err) {
		console.log(err);
	} else {
		console.log("Connected to the database");
	}
});

//Express App Setup

app.use(morgan('combined')); //logs incoming requests
app.use(cors());
app.use(bodyParser.json({ type: '*/*' })); //parses incoming requests into JSON, '*/*' accepts any type of request
router(app);

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.send(__dirname + '/public/index.html');
});

app.get('*', function (req, res) {
	res.sendFile(path.resolve(__dirname + '/public/index.html'));
});

//Server Setup and Initialization

const PORT = process.env.PORT || 3000;

//Define http server below and set up

const SERVER = http.createServer(app); //creates an http server that can receive requests and forward them to app (express())

SERVER.listen(PORT, function() {
	console.log('Server listening on port:', PORT);
});
