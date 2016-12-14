import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import * as actions from '../../actions';
import toastr from 'toastr';

class Signup extends Component {

	//formProps are all of the fields being controlled by redux form (email, password, passwordConfirm)
	//handleSubmit will not be called if errors exist
	handleFormSubmit(formProps) {
		//call action creator to sign up the user
		this.props.signupUser(formProps)
			.then(() => {
				toastr.success("New Account Created! You are logged in.");
			})
			.catch(() => {
				toastr.warning("Account could not be created. Email may already exist.");
			});
	}

	renderAlert() {
		if (this.props.errorMessage) {
			return (
				<div id="errorMessage" className="alert alert-danger">
				  <strong>{this.props.errorMessage}</strong>
				</div>
			);
		}
	}

	render() {
		//When the error object is returned from validate(), each field: email, password etc,
		//is assigned an error property equal to the error object's value for each field (returned from validate)
		//{password.touched && password.error && <div className="error">{password.error}</div>}
		//the statement above returns the third condition after the && operators if the first two statements are true
		//touched means the user has clicked in and out of the input field
		const {handleSubmit, fields: { email, password, passwordConfirm }} = this.props;
		return (
			<div className="col-xs-6 offset-xs-3">
				<form onSubmit={handleSubmit(this.handleFormSubmit.bind(this))}>
					<fieldset className="form-group">
						<label>Email:</label>
						<input {...email} className="form-control" />
					</fieldset>
						{email.touched && email.error && <div className="error">{email.error}</div>}
					<fieldset className="form-group">
						<label>Password:</label>
						<input {...password} type="password" className="form-control" />
						{password.touched && password.error && <div className="error">{password.error}</div>}
					</fieldset>
					<fieldset className="form-group">
						<label>Confirm Password:</label>
						<input {...passwordConfirm} type="password" className="form-control" />
					</fieldset>
						{passwordConfirm.touched && passwordConfirm.error && <div className="error">{passwordConfirm.error}</div>}
						{this.renderAlert()}
					<button id="signInBtn" action="submit" className="btn btn-primary">Sign Up</button>
				</form>
			</div>
		);
	}

}

function validate(formProps) {
	const errors = {}; //this will contain the errors for all fields in the form and will be returned from this function

	if (!formProps.email) {
		errors.email = 'Please enter an email';
	}
	if (!formProps.password) {
		errors.password = 'Please create a password';
	}
	if (!formProps.passwordConfirm) {
		errors.passwordConfirm = 'Please confirm your password';
	}

	if (formProps.password !== formProps.passwordConfirm) {
		errors.password = 'Passwords must match';
	}

	return errors;
}

function mapStateToProps(state) {
	return { errorMessage: state.auth.error };
}

export default reduxForm({
	form: 'signup',
	fields: ['email', 'password', 'passwordConfirm'],
	validate //es5 = validate : validate // this function will be run every time the form changes
}, mapStateToProps, actions)(Signup);
