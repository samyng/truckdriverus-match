import React, { Component } from 'react';

class Feature extends Component {

	constructor(props) {
		super(props);
		this.state = {
			jwt: ''
		};
	}
	componentWillMount() {
		this.setState({
			jwt: localStorage.getItem('token')
		});
	}

	render() {
		return (
			<div className="row">

				<p className="alert-success">Your JWT is now valid!</p>

			</div>
		);
	}
}


export default Feature;
