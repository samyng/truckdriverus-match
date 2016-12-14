import React, {Component} from 'react';
import {connect} from 'react-redux';
import { browserHistory } from 'react-router';

export default function(ComposedComponent) { //This code right here serves as the base for any high order component

	class Authentication extends Component {

		componentWillMount() {
			if (!this.props.authenticated) {
				browserHistory.push('/');
			}

		}

		componentWillUpdate(nextProps) {
		 //this lifecycle method runs when the component is about to update with new props, nextProps are those new properties for the rerender
			if (!nextProps.authenticated) {
				browserHistory.push('/');
			}
		}

		//{...this.props} makes sure the new combined component Enhanced Component will have all the props of the original component passed into this function/Authentication class
		//it maintains those props even though it's combining two components together to form a Enhanced Component
		render() {

			return (
				<ComposedComponent {...this.props} />
			);
		}

	}

	function mapStateToProps(state) {
		return { authenticated: state.auth.authenticated };
	}

	return connect(mapStateToProps, null)(Authentication);
}
