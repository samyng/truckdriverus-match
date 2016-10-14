import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';

class Signout extends Component {

	componentWillMount() {
		this.props.logoutUser(); //Signs out user as soon as they hit this route
		//This strategy allows the use of a message to show the user before they leave
	}

	render() {
		return (
			<div>Your JWT was destroyed...</div>
		);
	}

}

export default connect(null, actions)(Signout);
