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
        <div className="col-xs-6 offset-xs-3">
  				<div className="form-group">
            <label>Your Email</label>
  					<input
  						id="email"
  						className="form-control"
  						type="email"
  						name="email"
  						onChange={this.handleUpdateFormState} />
  				</div>

  				<button id="signInBtn" className="btn btn-primary" onClick={this.handleSubmit}>Submit</button>

					<div className="text-center error">
						{this.props.errorMessage}
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
