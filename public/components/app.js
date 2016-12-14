import React from 'react';
import { Component } from 'react';
import Header from './header';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import * as styles from '../styles/styles.scss';

class App extends Component {
  componentWillMount() {
    if (this.props.authenticated) {
      browserHistory.push('/feature');
    }
  }

  render() {
    return (
      <div className="container">
        <Header />
        {this.props.children}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { authenticated: state.auth.authenticated };
}

export default connect(mapStateToProps, null)(App);
