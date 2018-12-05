import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title,Text, Toast, Icon, Button, Tabs, Tab, TabHeading } from 'native-base';
import {View, Platform} from 'react-native';
import Activos from './Tabs/Activos';
import Completados from './Tabs/Completados';

export const toastr = {
  /***
   * Mostrar Toast en la parte de abajo durante 3 segundos con un mensaje y tipo especifico
   * @param {String} message mensaje a mostrar en el Toast
   * @param {String} tipo tipo de Toast (success,warning,danger)
   */
  showToast: (message,tipo) => {
    Toast.show({
      text: message,
      duration: 3000,
      buttonText: "Ok",
      type: tipo
    });
  },
};

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      page: 0,
      showToast: false
    };
    let token = this.props.token;
    this.ChangePage = this.ChangePage.bind(this);
    console.ignoredYellowBox = ['Require cycle:'];
  }

  async componentWillMount() {
  }

  /**
   * cambiar Tab inicial del header
   * @param {int} page valor de la pagina inicial del header
   * @example 0 = Activos , 1 = Completados
   */
  ChangePage(page)
  {
    console.log(page);
    this.setState({page: page});
  }

  render() {
    return (
      <Container>
        <Header hasTabs style={{paddingTop: 20}}>
          <Left/>          
          <Body>
            <Title>Home</Title>
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
        <Tabs initialPage={this.state.page} onChangeTab={() => this.ChangePage()}>
            <Tab heading={ <TabHeading><Text>Activos</Text></TabHeading>}>
              <Activos handler2={this.props.handler2} token={token} data={this.props.data} ChangePage={this.ChangePage}/>
            </Tab>
            <Tab heading={ <TabHeading><Text>Completados</Text></TabHeading>}>
              <Completados handler2={this.props.handler2} token={token} data={this.props.data} ChangePage={this.ChangePage}/>
            </Tab>
          </Tabs>
      </Container>
    );
  }
}