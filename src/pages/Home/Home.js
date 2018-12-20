import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title,Text, Icon, Button, Tabs, Tab, TabHeading } from 'native-base';
import {View} from 'react-native';
import IconStyles from '../../styles/Icons';
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
                    <Icon ios="ios-calendar" android="md-calendar" style={IconStyles.header}></Icon>
                </Button>
                <Button transparent onPress={() => this.props.handler2(-1,token,[])}>
                    <Icon ios="ios-log-out" android="md-log-out" style={IconStyles.header}></Icon>
                </Button>
            </Right>
          </Header>
        <Tabs tabContainerStyle={{elevation:0}}>
          <Tab style={{backgroundColor: '#f4f4f4'}} heading={ <TabHeading><Text>Activos</Text></TabHeading>}>{/* #E1F5FE */}
            <Activos handler2={this.props.handler2} token={token} data={this.props.data}/>
          </Tab>
          <Tab style={{backgroundColor: '#f4f4f4'}} heading={ <TabHeading  ><Text>Completados</Text></TabHeading>}>
            <Completados handler2={this.props.handler2} token={token} data={this.props.data}/>
          </Tab>
        </Tabs>
      </Container>
    );
  }
}