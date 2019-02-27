import React, { Component } from 'react';
import {Preload} from './src/services/Preload';
import Index from './src/pages/Index';


export default class App extends Component {
  constructor(props) {
    super(props);
    console.ignoredYellowBox = ['Require cycle:'];
  }

  async componentDidMount(){
    try{
      Preload.images();
    }
    catch(error){console.log(error)}
  }

  render() {
    return (
      <Index/>
    );
  }
}