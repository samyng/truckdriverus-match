// load environment configurations
require('./backend/config/config');


//Main starting point of the application
const express = require('express');
const fs = require("fs");
const morgan = require('morgan');
const app = express();
const router = require('./backend/router');
// import mongoose with custom settings
const { mongoose } = require('./backend/db/mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const axios = require('axios');
const sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
const _ = require('underscore');
const async = require('async');

// import and create bitly object
// const Bitly = require('bitly');
// const bitly = new Bitly('YOUR_BITLY_API_KEY_HERE');


//Express App Setup

app.use(morgan('combined')); //logs incoming requests
app.use(cors());

router(app);
// import mongoose models
const Candidate = require('./backend/models/candidate');

//Converter Class
var Converter = require("csvtojson").Converter;

//import multer
var multer  = require('multer');

// multer storage options
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null,  'public/uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, 'candidates.csv');
  }
});

// define multer opload
var upload = multer({ storage: storage });

// import plivo
var plivo = require('plivo');
var p = plivo.RestAPI({
  authId: process.env.PLIVO_AUTH_ID,
  authToken: process.env.PLIVO_AUTH_TOKEN
});

// nodemailer configuration with sendgrid
// var smtpTransport = nodemailer.createTransport('SMTP', {
//   service: 'SendGrid',
//   auth: {
//     user: process.env.SEND_USER,
//     pass: process.env.SEND_PASS
//   }
// });

//Express App Setup

app.use(morgan('combined')); //logs incoming requests
app.use(cors());

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

// application logic, route definitions

app.post('/', upload.single('userFile'), function(req, res, next) {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/updateCandidates', function(req, res, next) {
  readCSV()
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      res.sendStatus(400);
    });
});

app.post('/sendSMS', function(req, res, next) {
  axios.get(FEED_URL)
    .then(data => {
      let jobs = data.data.jobs;
      fetchClients(jobs, 'sms').then(() => {
        res.sendStatus(200);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(400);
      })
    })
    .catch(error => {
      console.log(error);
    });
});

app.post('/sendEmails', function(req, res, next) {
  axios.get(FEED_URL)
    .then(data => {
      let jobs = data.data.jobs;
      fetchClients(jobs, 'email').then(() => {
        res.sendStatus(200);
      })
      .catch((err) => {
        console.log(err);
        res.status(404).json(err);
      })
    })
    .catch(error => {
      console.log(error);
    });
});


// BEGIN HELPER FUNCTIONS --------------------------------------->
// const extractCity = location => {
//   const city = location.substr(0, location.indexOf(','));
//   return city;
// };
//
const extractState = location => {
  const state = location.substr(location.indexOf(',') + 1, location.length);
  return state;
};

// adds a space after the comma between city and state,
// data in the jobs2careers feed looks like this (Portland,OR)
const addSpaceAfterComma = str => {
  const withSpace = str.replace(/,/g, ', ');
  return withSpace;
};

const containsUberLyft = string => {
  const containsBool = string.toLowerCase().includes('uber') || string.toLowerCase().includes('lyft');
  return containsBool;
};

const containsInstaCart = string => {
  const containsBool = string.toLowerCase().includes('instacart');
  return containsBool;
};

const containsPostmates = string => {
  const containsBool = string.toLowerCase().includes('postmates');
  return containsBool;
};

const containsDeliv = string => {
  const containsBool = string.toLowerCase().includes('deliv');
  return containsBool;
}

const priceIsHigh = price => {
  return price.toLowerCase() === 'high';
};

const selectJobsLessThanMax = (candidatesJobs, jobsSent, max) => {
  let jobsThatPass = candidatesJobs.filter(job => {
    let jobAlreadySent = _.findWhere(jobsSent, { jobId: job.id });
    if (jobAlreadySent === undefined || jobAlreadySent.sent < max) {
      return true;
    }
  });
  return jobsThatPass;
};



let totalSMSSent = 0;

const sendPlivoSMS = (number, message) => {
    var params = {
      'src': '+18555293620',
      'dst' : `+1${number}`,
      'text' : message
    };

    p.send_message(params, function (status, response) {
      totalSMSSent++;
      console.log("Here are the total SMS sent: ", totalSMSSent);
      console.log('Status: ', status);
      console.log('API Response:\n', response);
    });
};
let totalEmails = 0;
const sendEmail = (firstName = '', email, jobURL) => {

  var request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: {
      personalizations: [
        {
          to: [
            {
              email: email,
            },
          ],
          subject: 'Interested in a new role?',
        },
      ],
      from: {
        email: 'Tiffany@truckdriverus.com',
        name: 'Tiffany Hall'
      },
      content: [
        {
          type: 'text/html',
          value: `<html>
                    <p>Hi ${firstName},</p>
                    <br/>
                    <p>
                      My name is Tiffany. I found your profile online and you look like a
                      great fit for this role - are you interested?
                      ${jobURL}
                    </p>
                    <br/>
                    <p>Thanks!</p>
                    <p>Tiffany</p>
                    <br/>
                    <p>--</p>
                    <p>Tiffany Hall</p>
                    <p><a href="https://www.truckdriverus.com/">Truck Driver US</a></p>
                  </html>`
        },
      ],
    },
  });

  // Access SendGrid API to send request
  totalEmails++;
  console.log('Here are the total number of emails ', totalEmails);
  sg.API(request)
    .then(response => {
      console.log(response.statusCode);
      console.log(response.body);
      console.log(response.headers);
    })
    .catch(error => {
      //error is an instance of SendGridError
      //The full response is attached to error.response
      console.log(error.response.statusCode);
    });
};

const createCandidates = () => {
  // var names = ['Marcus', 'Andrew', 'Crystal', 'Bean', 'Kathy'];
  // var states = ['GA', 'TN', 'OH', 'TN', 'CA'];
  // var numbers = ['7064834776', '7064834777', '7064834778', '7064834779', '7064834780'];
  // for (var i = 0; i < names.length; i++) {
  //   const candidate = new Candidate();
  //   candidate.firstName = names[i];
  //   candidate.lastName = names[i];
  //   candidate.email = names[i];
  //   candidate.state = states[i];
  //   // remove dashes from candidate's phone number before saving
  //   candidate.phone = numbers[i];
  //   candidate.save();
  // }

  const candidate = new Candidate();
  candidate.firstName = 'Marcus';
  candidate.lastName = 'Hurney';
  candidate.email = 'marcushurney@gmail.com';
  candidate.state = 'GA';
  // remove dashes from candidate's phone number before saving
  candidate.phone = '7064834776';
  candidate.save();

  // let candidate = new Candidate();
  // candidate.firstName = 'Kathy';
  // candidate.lastName = 'Nguyen';
  // candidate.email = 'marcushurney@gmail.com';
  // candidate.state = 'MA';
  // // remove dashes from candidate's phone number before saving
  // candidate.phone = '4043940821';
  // candidate.save();

  // const candidate = new Candidate();
  // candidate.firstName = 'Colby';
  // candidate.lastName = 'Grant';
  // candidate.email = 'marcushurney@gmail.com';
  // candidate.state = 'GA';
  // // remove dashes from candidate's phone number before saving
  // candidate.phone = '7707898369';
  // candidate.save();
};
//
// createCandidates();

// below, this could be turned into a test
// const jobsSentTest = [{ sent: 48, id: 1 }, { sent: 50, id: 2 }, { sent: 50, id: 3 }, { sent: 0, id: 4 }];
// const candidateTestJobs = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
//
// var myTest = selectJobsLessThanMax(candidateTestJobs, jobsSentTest, 50);
// console.log(myTest);
// above, this could be turned into a test

// END HELPER FUNCTIONS --------------------------------------->





const FEED_URL = 'http://api.jobs2careers.com/api/search.php?id=2538&pass=v9NloGlKCT8SwVeb&ip=2601:c0:c100:2bc:9902:4667:1173:86ed&q=&l=USA&industry=Trucking&format=json&limit=200';
const PUBLISHER_ID = '2595';
const MAX_MESSAGE_LIMIT = 50;
let jobs = [];
let matchingClients = [];

const fetchClients = (allJobs, typeOfReq) => {
  return new Promise((resolve, reject) => {
    async.each(allJobs, function(job, callback) {

      // for each city in the job.city array, add a space after the comma
      // goes from: Atlanta,GA => Atlanta, GA
      // let jobCities = job.city.map(city => {
      //   return addSpaceAfterComma(city);
      // });
      let jobStates = job.city.map(city => {
        return extractState(city);
      });

      // change back to jobCities to search by city and state
      Candidate.find({ state: { "$in": jobStates }})
        .lean().exec(function(err, candidates) {

          let newMatches = [];

          candidates.forEach(candidate => {
            // check if client already exists in matchingClients
            let existingCandidate = {};
            existingCandidate = _.findWhere(matchingClients, { phone: candidate.phone });

            // if the job does not contain uber or lyft and the price is high continue
            if (!containsUberLyft(job.title) &&
                priceIsHigh(job.price) &&
                !containsInstaCart(job.description) &&
                !containsPostmates(job.description) &&
                !containsDeliv(job.title)){
              // check to see if the matched candidate already exists
              if (existingCandidate) {
                // add job to existing job
                existingCandidate.jobs = [ ...existingCandidate.jobs, job];
              } else {
                // this is a new matched candidate so create jobs array
                candidate.jobs = [];
                candidate.jobs = [job];
                // push newly matched candidate onto newMatches array
                newMatches = [ ...newMatches, candidate ];
              }
            } else {
              return;
            }
          });

          // push newMatches array onto matchingClients
          matchingClients = [ ...matchingClients, ...newMatches ];

          callback();
        });

    }, function(err) {
        if( err ) {
          console.log(err);
          reject(err);
        } else {
          // pass all matchingClients with their associated jobs onward to sendJobs
          resolve(sendJobs(matchingClients, typeOfReq));
        }
    });
  });
};

let totalMessages = 0;
const sendJobs = (candidatesArray, typeOfReq) => {

  return new Promise((resolve, reject) => {
    // array for tracking which jobs have been sent via sms
    let jobsSent = [];

    async.each(candidatesArray, function(candidate, callback) {

      // find all jobs on candidate's job array that have been sent less than 50 times
      let jobsUnderLimit = selectJobsLessThanMax(candidate.jobs, jobsSent, MAX_MESSAGE_LIMIT);

      // only send a job if the array jobsUnderLimit is populated, otherwise do nothing
      if (jobsUnderLimit.length) {
        // send the first job in the passing jobs array for this candidate
        let jobToSend = jobsUnderLimit[0];

        // construct jobURL
        let jobURL = `http://www.jobs2careers.com/click.php?id=${jobToSend.id}.${PUBLISHER_ID}`;

        // send message without bitly START

        // make sure candidate.firstName is not undefined
        let candidateFirstName;
        if (candidate.firstName == undefined) {
          // assign empty string so message looks natural;
          candidateFirstName = '';
        } else {
          // candidate.firstName exists, so continue
          candidateFirstName = candidate.firstName;
        }

        // defines the content of the sms
        let messageToSend =  `Hi ${candidateFirstName}! My name is Tiffany. I found your profile online and you look like a great fit for this role - are you interested? ${jobURL}`;
        // console.log(`You sent a message to ${candidate.firstName} ${candidate.lastName}. He/She lives in ${candidate.state}`);

        if (typeOfReq === 'sms') {
          // send the actual SMS here
          sendPlivoSMS(candidate.phone, messageToSend);
        } else if (typeOfReq === 'email') {

          sendEmail(candidate.firstName, candidate.email, jobURL);
        }

        // send message with BITLY START
        // bitly.shorten(jobURL)
        //   .then(function(response) {
        //     console.log(response);
        //     var short_url = response.data.url
        //     // console.log(jobURL);
        //     // console.log(short_url);
        //     let messageToSend =  `Hi ${candidate.firstName}! My name is Tiffany. I found your profile online and you look like a great fit for this role - are you interested? ${short_url}`;
        //     // console.log(`You sent a message to ${candidate.firstName} ${candidate.lastName}. He/She lives in ${candidate.state}`);
        //
        //     if (typeOfReq === 'sms') {
        //       // send the actual SMS here
        //
        //       sendPlivoSMS(candidate.phone, messageToSend);
        //     } else if (typeOfReq === 'email') {
        //       // send the email
        //       // if (candidate.email === 'marcushurney@gmail.com' || candidate.email === 'jennifer@gethappie.me') {
        //       //   sendEmail(candidate.firstName, candidate.email, jobURL);
        //       // }
        //       sendEmail(candidate.firstName, candidate.email, jobURL);
        //     }
        //   }, function(error) {
        //     throw error;
        //   });

        // JOB HAS BEEN SENT, NOW TRACK THE JOB

        // 1: jobJustSent is the job that was just sent via SMS
        let jobJustSent = { jobId: jobToSend.id , sent: 1 };

        // 2: see if jobJustSent already exists in our tracking array (jobsSent)
        let jobExists = _.findWhere(jobsSent, { jobId: jobJustSent.jobId });

        if (jobExists) {
          // 3: if job already exists, increment the sent property
          jobExists.sent++;
        } else {
          // 4: job does not exist so add it to jobsSent with a default sent = 1
          jobsSent = [ ...jobsSent, jobJustSent];
        }
      }

      callback();
    }, function(err) {
      // if any of the file processing produced an error, err would equal that error
      if( err ) {
        console.log(err);
        reject(err);
      } else {
        let total = 0;
        jobsSent.map(job => {
          total += job.sent;
        });
        console.log("Here is the total number of jobs matched ", total);
        // console.log("Here are the total messages sent via Plivo ", totalSMSSent);
        console.log(jobsSent);
        resolve();
      }
    });
  });
};


const readCSV = () => {
  return new Promise((resolve, reject) => {
    //CSV File Path or CSV String or Readable Stream Object
    var csvFileName="./public/uploads/candidates.csv";

    //new converter instance
    var csvConverter = new Converter({});

    //end_parsed will be emitted once parsing finished
    csvConverter.on("end_parsed",function(jsonObj){
        jsonObj.forEach(person => {
          // console.log(person);
          // console.log(person.firstname);
          // console.log(person.lastname);
          // console.log(person.email);
          // console.log(person.location);
          // console.log(person.phone);
          // this below works with Trucker Test File
          // const candidate = new Candidate();
          // candidate.firstName = person['firstname'];
          // candidate.lastName = person['lastname'];
          // candidate.email = person['email'];
          // candidate.location = person['location'];
          // candidate.state = extractState(person['location']).trim();
          // // remove dashes from candidate's phone number before saving
          // candidate.phone = person['phone'].replace(/-/g, "");
          // candidate.save();

          // original
          // console.log(person['First Name']);
          // console.log(person['Last Name']);
          // console.log(person['Email']);
          // console.log(person['Location']);
          // if (person['Phone']) {
          //   console.log(person['Phone']);
          // }

          const candidate = new Candidate();

          candidate.firstName = person['First Name'];
          candidate.lastName = person['Last Name'];
          candidate.email = person['Email'];
          candidate.location = person['Location'];
          // extract state from location
          candidate.state = extractState(person['Location']).trim();
          // remove dashes from candidate's phone number before saving
          if (person['Phone']) {
            candidate.phone = person['Phone'].replace(/-/g, "");
          }
          candidate.save();
        });
        resolve();
    });

    //read from file
    fs.createReadStream(csvFileName).pipe(csvConverter);
  })
  .catch((err) => {
    reject(err);
  });
};
