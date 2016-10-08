import axios from 'axios';
import { browserHistory } from 'react-router';
import { AUTH_USER, UNAUTH_USER, AUTH_ERROR, FETCH_MESSAGE } from './types';

export function signinUser({ email, password }) {

	return function(dispatch) { //Redux thunk will call this function with the dispatch method as a parameter (for use below) whenever signinUser is called
		// Submit email/password to the server
		axios.post(`/signin`, { email, password })
			.then(response => {
				//If request is good...
				// - Update state to indicate user is authenticated
				dispatch({ type: AUTH_USER });
				// - Save the JWT token
				localStorage.setItem('token', response.data.token);
				// - redirect to the route '/feature'
				browserHistory.push('/feature');
			})
			.catch(() => {
				//If request is bad...
				// - Show error to the user
				dispatch(authError('Incorrect email or password'));
			});


	}

}

export function signupUser({ email, password }) {
	return function(dispatch) {
		axios.post(`/signup`, { email, password })
		.then(response => {
			dispatch({ type: AUTH_USER });
			localStorage.setItem('token', response.data.token);
			browserHistory.push('/feature');
		})
		.catch(response => dispatch(authError(response.data.error)))
	}
}

export function signoutUser() {

	localStorage.removeItem('token'); //destroys the user's JWT stored in local storage

	return {
		type: UNAUTH_USER
	}
}

export function authError(error) {
	return {
		type: AUTH_ERROR,
		payload: error
	};
}
