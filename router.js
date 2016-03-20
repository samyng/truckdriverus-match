//req is the object containing data about the incoming http request
//res is the response that will be sent back to whoever made the request);

const Authentication = require('./controllers/authentication');
const passportService = require('./services/passport');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

module.exports = function (app) {

	app.get('/', requireAuth, function(req, res) {
		res.send({ hi: 'there'});
	});

	app.post('/signin', requireSignin, Authentication.signin); //Before the user can actually sign in, the passwords are compared in the local stratgey requireSignin

	app.post('/signup', Authentication.signup);
											
}