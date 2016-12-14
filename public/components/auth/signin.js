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
			<div className="col-xs-6 offset-xs-3">
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
				  <button id="signInBtn" action="submit" className="btn btn-primary">Sign in</button>
			  </form>
			</div>
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
