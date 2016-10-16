import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { forgotPassword, authError } from '../../actions';
import { connect } from 'react-redux';
import toastr from 'toastr';

class ForgotPassword extends Component {

	constructor(props, context) {
		super(props, context);
		this.state = {
			email: ''
		};

		this.handleUpdateFormState = this.handleUpdateFormState.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit() {
    const { forgotPassword, authError } = this.props;

		const email = this.state.email;

    const props = {
      email
    };

		forgotPassword(props)
      .then(() => {
        toastr.success("An email was sent with instructions for resetting your password");
        browserHistory.push('/');
      })
      .catch((err) => {
        toastr.warning("Email does not exist");
      });
	}

	handleUpdateFormState(event) {
		this.setState({
      email: event.target.value
    });
	}

	render() {

      return (
        <div>
  				<div className="form-group">
            <label>Your Email</label>
  					<input
  						id="email"
  						className="form-control"
  						type="email"
  						name="email"
  						onChange={this.handleUpdateFormState} />
  				</div>

  				<button className="btn btn-primary" onClick={this.handleSubmit}>Submit</button>

					<div className="text-center error">
						{this.props.errorMessage}
					</div>

					<div id="signInMessage" className="row alert alert-success">
			    	<ul>

			    	  <li>
								<i className="fa fa-cube fa-2x" aria-hidden="true"></i>
								If a user forgets his or her password. It is possible to reset the password
								via the following steps.
			    	  </li>

			    	  <li>
								 <i className="fa fa-cube fa-2x" aria-hidden="true"></i>
								 The user provides the email address used at the time of signup.
								 The provided email address is sent to the server and the database
								 is queried. If the user is found, a reset token is created using crypto.
								 The token is saved to the user instance and sent to the user via email.
								 The token is sent as a url parameter on a reset link which allows the user
								 to visit the password reset page.
			    	  </li>

			    	  <li>
									<i className="fa fa-cube fa-2x" aria-hidden="true"></i>
									On the reset page, the user must enter a new password. The new password
									and the reset token are sent to the server. The server queries the database
									using the reset token. The token is only valid for 1 hour after its creation
									for security purposes. If the user tries to reset his or her password later than
									1 hour after receiving the token, the reset attempt will fail. If a user is found
									and the token is valid, the user's password will be hashed and salted, then saved
									to the user instance effectively resetting the old password.
			    	  </li>
			    	  <li>
									<i className="fa fa-cube fa-2x" aria-hidden="true"></i>
									An email is sent to the user notifying that the password was successfully
									reset.
			    	  </li>
			    	</ul>
			    </div>
        </div>

  		);

	}

}


function mapStateToProps(state) {
	return { authenticated: state.auth.authenticated,
	 				 errorMessage: state.auth.error
				 };
}

export default connect(mapStateToProps, { forgotPassword, authError })(ForgotPassword);
