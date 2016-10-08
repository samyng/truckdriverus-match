import React from 'react';
import { Component } from 'react';
import Header from './header';
import * as styles from '../styles/styles.scss';

export default class App extends Component {
  render() {
    return (
      <div>
        <Header />
        {this.props.children}
      </div>
    );
  }
}
