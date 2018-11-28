import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, Form, Item, Input,Text, Button, Toast } from 'native-base';
import {View} from 'react-native';
import {ipLogin} from '../services/api'

export const toastr = {
  showToast: (message,tipo) => {
    Toast.show({
      text: message,
      duration: 3000,
      buttonText: "Ok",
      type: tipo
    });
  },
};

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: 'ne.ko@hotmail.es', 
      password: '123456',
      loading: true,
      error:null,
      showToast: false
    };
    this._OnLogin = this._OnLogin.bind(this);
    let token = null;
  }

  async componentWillMount() {
    await Expo.Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
    });
    this.setState({ loading: false });
  }

  _OnLogin(handler){
    //let ip = "http://192.168.1.136/supervisores_api/public/api/login";//"http://192.168.1.185/supervisores_api/public/api/login";
    let username = this.state.email;
    let pass = this.state.password;
    fetch(ipLogin, {
    method: 'POST',
    headers: {
        'Authorization': 'Access',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({username: username, password: pass})
    }).then(function(response) {
        //console.log(response);
        if(response.ok === true)
        {
            token = response;
            handler(1,token);
            toastr.showToast('Se ha logueado Correctamente!','success');
        }
        else
        {
            toastr.showToast('Credenciales incorrectas','danger');
        }
        return response.json();
      }).catch(function(error){
        toastr.showToast('Verifique su conexión a internet','warning');
      });
    }

  render() {
    if (this.state.loading) {
      return <Expo.AppLoading />;
    }
    return (
      <Container>
        <Header style={{paddingTop: 20}}>
        <Left/>          
        <Body>
          <Title>Inicio</Title>
        </Body>
        <Right />
        </Header>
        <Content>
          <Form>
            <Item>
              <Input placeholder='Usuario' defaultValue="ne.ko@hotmail.es" onChangeText={(text) => this.setState({email: text})}/>
            </Item>
            <Item>
              <Input placeholder='Contraseña' defaultValue="123456" secureTextEntry={true}  onChangeText={(text) => this.setState({password: text})}/>
            </Item>
          </Form>
          <Button block style={{marginBottom: 5}} onPress={() => this._OnLogin(this.props.handler)}>
            <Text>Iniciar Sesión</Text>
          </Button>
        </Content>
      </Container>
    );
  }
}