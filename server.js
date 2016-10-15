// load environment configurations
require('./backend/config/config');


//Main starting point of the application
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const router = require('./backend/router');
// import mongoose with custom settings
const { mongoose } = require('./backend/db/mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');



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

const PORT = process.env.PORT;

//Define http server below and set up

const SERVER = http.createServer(app); //creates an http server that can receive requests and forward them to app (express())

SERVER.listen(PORT, function() {
	console.log('Server listening on port:', PORT);
});
