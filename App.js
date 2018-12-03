
import React, { Component } from 'react';

import Index from './src/pages/Index';

export default class App extends Component {
  constructor(props) {
    super(props)
    console.ignoredYellowBox = ['Require cycle:'];
  }

  render() { 
    return (
        <Index/>
    );
  }
}