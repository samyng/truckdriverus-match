import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import toastr from 'toastr';

class Signout extends Component {

	componentWillMount() {
		//Signs out user as soon as they hit this route
		//This strategy allows the use of a message to show the user before they leave
		this.props.logoutUser().then(() => {
			toastr.success("You are logged out!");
		});
	}

	render() {
		return (
			<div>Your JWT was destroyed...</div>
		);
	}

}

export default connect(null, actions)(Signout);
