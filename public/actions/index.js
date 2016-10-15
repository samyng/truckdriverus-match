import axios from 'axios';
import { browserHistory } from 'react-router';
import { AUTH_USER, UNAUTH_USER, AUTH_ERROR, FETCH_MESSAGE, FORGOT_PASSWORD } from './types';

export function loginUser({ email, password }) {

	return function(dispatch) { //Redux thunk will call this function with the dispatch method as a parameter (for use below) whenever signinUser is called
		// Submit email/password to the server
		return axios.post(`/users/login`, { email, password })
			.then(response => {
				//If request is good...
				// - Update state to indicate user is authenticated
				dispatch({ type: AUTH_USER });

				// - Save the JWT token
				localStorage.setItem('token', response.headers['x-auth']);
			})
			.catch(() => {
				reject();
			});
	}
}

export function signupUser({ email, password }) {
	return function(dispatch) {
		// call signup route
		return axios.post(`/users/signup`, { email, password })
			.then(response => {
				// response is succssful, auth user in redux store
				dispatch({ type: AUTH_USER });
				// pull jwt from x-auth header and save to localStorage
				localStorage.setItem('token', response.headers['x-auth']);
				// navigate client route to '/feature'
				browserHistory.push('/feature');
			})
			.catch(response => {
				// account was not created, reject promise
				reject();
			});
	}
}

export function logoutUser() {
	return (dispatch) => {
		// set token as a header, so it can be deleted on back-end
		const config = {headers: {'x-auth' : localStorage.getItem('token')}};

		return axios.delete('/users/logout', config).then(() => {
			//destroys the user's JWT stored in local storage
			localStorage.removeItem('token');
			dispatch({ type: UNAUTH_USER });
		}).catch(() => {
			reject();
		});
	}
}

export function authError(error) {
	return {
		type: AUTH_ERROR,
		payload: error
	};
}

export function forgotPassword(props) {
	return (dispatch) => {
		const jsonProps = JSON.stringify(props);
		return axios.post(`/forgotPassword`, jsonProps)
			.then(() => {
				dispatch({ type: FORGOT_PASSWORD });
			})
			.catch(() => {
				reject();
			});
	}
}

export function resetPassword(props, token) {
	return (dispatch) => {
		const jsonProps = JSON.stringify(props);

		return axios.post(`/resetPassword/${token}`, jsonProps)
			.then(() => {
				dispatch({ type: RESET_PASSWORD });
			})
			.catch(error => {
				reject();
			});
	}
}
