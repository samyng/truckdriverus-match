import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './components/app';
import Signin from './components/auth/signin';
import Signup from './components/auth/signup';
import Signout from './components/auth/signout';
import Feature from './components/feature';
import ForgotPassword from './components/auth/forgot_password';
import ResetPassword from './components/auth/reset_password';
import RequireAuth from './components/auth/require_auth';

export default (
	<Route path="/" component={App}>
		<IndexRoute component={Signin} />
		<Route path="signin" component={Signin} />
		<Route path="signout" component={Signout} />
		<Route path="signup" component={RequireAuth(Signup)} />
		<Route path="forgot-password" component={ForgotPassword} />
		<Route path="reset-password/:token" component={ResetPassword} />
		<Route path="feature" component={RequireAuth(Feature)} />
	</Route>
);
