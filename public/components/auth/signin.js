import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import { browserHistory } from 'react-router';
import * as actions from '../../actions';
import toastr from 'toastr';

class Signin extends Component {

	handleFormSubmit({ email, password }) {
		this.props.loginUser({ email, password }).then(() => {
			toastr.success("You are logged in!");
			browserHistory.push('/feature');
		}).catch(() => {
			toastr.warning("Could not log in");
		})
	}

	renderAlert() {
		if (this.props.errorMessage) {
			return (
				<div className="alert alert-danger">
					<strong>{this.props.errorMessage}</strong>
				</div>
			);
		}
	}

	render() {

		const { handleSubmit, fields: { email, password }} = this.props; //These are added to props when the component is wrapped with redux form

		return (
			<form onSubmit={handleSubmit(this.handleFormSubmit.bind(this))}>
			  <fieldset className="form-group">
			    <label>Email:</label>
			    <input {...email} className="form-control" />
			  </fieldset>
			  <fieldset className="form-group">
			    <label>Password:</label>
			    <input {...password} type="password" className="form-control" />
			  </fieldset>
			  {this.renderAlert()}
			  <button action="submit" className="btn btn-primary">Sign in</button>

			    <div id="signInMessage" className="row alert alert-success">
			    	<ul>

							<li>
								<i className="fa fa-cube fa-2x" aria-hidden="true"></i>
								The user's user name and password are sent to the server.
								The user's email is used to fetch the associated user model from the MongoDB database.
								The user's plain text password is hashed and salted using bcrypt.
								The hashed and salted password is compared against the existing hashed and salted
								password stored in the database.
								If the user cannot be found with the provided email or the password
								doesn't match the one stored in the database, the user's sign in attempt
								will fail.

							</li>

			    	  <li>
								<i className="fa fa-cube fa-2x" aria-hidden="true"></i>
			    		  If the user successfully signs in, a JWT (JSON WEB TOKEN) will be added
								to the user model and stored in local storage. The JWT contains an eccrypted
			    		  version of the user's id and a secret code used by the server for
								decryption and user recognition.
			    	  </li>

			    	  <li>
								 <i className="fa fa-cube fa-2x" aria-hidden="true"></i>
			    	      Whenever the user makes a request to the server, it will check the JWT for validity
			    	      before providing access to a route with protected resources, such as querying the database.
			    	  </li>

			    	  <li>
									<i className="fa fa-cube fa-2x" aria-hidden="true"></i>
			    	      Since the JWT is stored in the browsers local storage, it will not be deleted when a user closes the browser
			    	      or navigates away from the page. This means that a user will still be logged in upon returning to the page. The
			    	      user must click sign out in order to destory the JWT stored in the browser.
			    	  </li>
			    	  <li>
									<i className="fa fa-cube fa-2x" aria-hidden="true"></i>
			    	      Redux Form is used to validate user input in the text boxes to ensure a blank field isnt submitted.
			    	  </li>
							<li>
									<i className="fa fa-cube fa-2x" aria-hidden="true"></i>
			    	      When a user signs out, the JWT is removed from local storage and from
									the user instance.
			    	  </li>
			    	</ul>

			    </div>
		    </form>
		);

	}
}

function mapStateToProps(state) {
	return { errorMessage: state.auth.error };
}

export default reduxForm({
	form: 'signin',
	fields: ['email', 'password']
}, mapStateToProps, actions)(Signin);
