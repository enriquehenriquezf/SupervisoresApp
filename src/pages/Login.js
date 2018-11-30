import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, Form, Item, Input,Text, Button, Toast, Icon, Card, CardItem } from 'native-base';
import {View, Dimensions} from 'react-native';
import {ipLogin} from '../services/api'

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
    /***
     * Cargar tipos de fuentes antes de mostrar el layout.
     */
    await Expo.Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
    });
    this.setState({ loading: false });
  }
  /**
   * Verificar credenciales de inicio de sesión
   * @param {function} handler Obtiene el token y un valor de un layout para cargar otro layout
   */
  _OnLogin(handler){
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
    /***
     * Mostrar layout luego de cargar tipos de fuente
     */
    if (this.state.loading) {
      return <Expo.AppLoading />;
    }
    var height = Dimensions.get('window').height;
    return (
      <Container>
        <Header style={{paddingTop: 20}}>
        <Left/>          
        <Body>
          <Title>Inicio</Title>
        </Body>
        <Right />
        </Header>
        <Expo.LinearGradient colors={['#062347', '#10A5BA', '#062347']} style={{ flex: 1}} start={[0.01,0.01]} end={[0.99,0.99]}>
          <Content>
            <Card style={{backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0)'}}>
              <CardItem style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
                <Icon active ios='ios-person' android='md-person' style={{color: 'white'}}/>
                <Input placeholder='Correo' placeholderTextColor='#ddd' defaultValue="ne.ko@hotmail.es" onChangeText={(text) => this.setState({email: text})} keyboardType='email-address' autoCapitalize='none'  style={{color: 'white'}}/>
              </CardItem>
              <CardItem style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
                <Icon active ios='ios-lock' android='md-lock'  style={{color: 'white'}}/>
                <Input placeholder='Contraseña' placeholderTextColor='#ddd' defaultValue="123456" secureTextEntry={true}  onChangeText={(text) => this.setState({password: text})} autoCapitalize='none'  style={{color: 'white'}}/>
              </CardItem>
              <CardItem style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
                <Body>
                  <Button block onPress={() => this._OnLogin(this.props.handler)}>
                    <Text>Iniciar Sesión</Text>
                  </Button> 
                </Body>
              </CardItem>              
            </Card>  
          </Content>
        </Expo.LinearGradient>
      </Container>
    );
  }
}