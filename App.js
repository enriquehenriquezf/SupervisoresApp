
import React, { Component } from 'react';
import { Root } from "native-base";

import Index from './src/pages/Index';

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false
    }
    console.ignoredYellowBox = ['Require cycle:'];
  }

  render() { 
    return (
      <Root>
        <Index/>
      </Root>
    );
  }
}