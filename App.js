import React, { Component } from 'react';
import {Preload} from './src/services/Preload';
import Index from './src/pages/Index';

export default class App extends Component {
  constructor(props) {
    super(props)
    console.ignoredYellowBox = ['Require cycle:'];
  }

  render() { 
    Preload.images();
    return (
      <Index/>
    );
  }
}