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
			<div>
				<h1>Your JWT:</h1>
				<p>{this.state.jwt}</p>
			</div>
		);
	}
}


export default Feature;
