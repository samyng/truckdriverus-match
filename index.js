//Main starting point of the application

const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const router = require('./router');
const mongoose = require('mongoose');

// DB Setup

mongoose.connect('mongodb://localhost:auth/auth');

//App Setup

app.use(morgan('combined')); //logs incoming requests
app.use(bodyParser.json({ type: '*/*' })); //parses incoming requests into JSON, '*/*' accepts any type of request
router(app);

//Server Setup

const port = process.env.PORT || 3090;
const server = http.createServer(app); //creates an http server that can receive requests and forward them to app (express())

server.listen(port);
console.log('Server listening on port:', port);








