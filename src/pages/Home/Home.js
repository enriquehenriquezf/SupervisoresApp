import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title,Text, Icon, Button, Tabs, Tab, TabHeading } from 'native-base';
import {View, Platform} from 'react-native';
import Activos from './Tabs/Activos';
import Completados from './Tabs/Completados';


export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      showToast: false
    };
    let token = this.props.token;
    console.ignoredYellowBox = ['Require cycle:'];
  }

  async componentWillMount() {
  }


  render() {
    return (
      <Container>     
          <Header hasTabs style={{paddingTop: 20, elevation:0}}>
            <Left/>          
            <Body>
              <Title>Actividades</Title>
            </Body>
            <Right>
                <Button transparent onPress={() => this.props.handler2(3,token,[])}>
                    <Icon ios="ios-calendar" android="md-calendar" style={{fontSize: 20, color: Platform.OS === 'ios' ? 'black' : 'white'}}></Icon>
                </Button>
                <Button transparent onPress={() => this.props.handler2(0,null,[])}>
                    <Icon ios="ios-log-out" android="md-log-out" style={{fontSize: 20, color: Platform.OS === 'ios' ? 'black' : 'white'}}></Icon>
                </Button>
            </Right>
          </Header>
        <Tabs tabContainerStyle={{elevation:0}}>
          <Tab style={{backgroundColor: '#f4f4f4'}} heading={ <TabHeading><Text>Activos</Text></TabHeading>}>{/* #E1F5FE */}
            <Activos handler2={this.props.handler2} token={token} data={this.props.data} ChangePage={this.ChangePage}/>
          </Tab>
          <Tab style={{backgroundColor: '#f4f4f4'}} heading={ <TabHeading  ><Text>Completados</Text></TabHeading>}>
            <Completados handler2={this.props.handler2} token={token} data={this.props.data} ChangePage={this.ChangePage}/>
          </Tab>
        </Tabs>
      </Container>
    );
  }
}