import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, Text, Toast, Icon, Button } from 'native-base';
import {View} from 'react-native';
import {ipHome} from '../services/api'

export const toastr = {
  /***
   * Mostrar Toast en la parte de abajo durante 3 segundos con un mensaje y tipo especifico
   * @param message: mensaje a mostrar en el Toast
   * @param tipo: tipo de Toast (success,warning,danger)
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

let items = null;
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      showToast: false
    };
    let token = this.props.token;
    items = this.props.data;
    let newToken = null;
    console.ignoredYellowBox = ['Require cycle:'];
  }

  async componentWillMount() {
    /***
     * Cargar tipos de fuentes antes de mostrar el layout.
     */
    await Expo.Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
    });
    this.setState({ loading: false });
  }

  componentDidMount()
  {
    //console.log(this.props.data);
  }

  render() {
    if (this.state.loading) {
      return <Expo.AppLoading />;
    }
    return (
      <Container>
        <Header>
        <Left>
            <Button transparent onPress={() => this.props.handler(0,null)}>
                <Icon ios="ios-arrow-back" android="md-arrow-back" style={{fontSize: 20, color: 'white'}}></Icon>
            </Button>
        </Left>          
        <Body>
          <Title>{items.sucursal}</Title>
        </Body>
        <Right />
        </Header>
        <Content>
            <Text>{items.name}</Text>
        </Content>
      </Container>
    );
  }
}