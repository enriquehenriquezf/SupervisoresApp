import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, Form, Item, Input,Text, Button, Toast, Icon, Spinner } from 'native-base';
import {View, Dimensions, KeyboardAvoidingView, StyleSheet } from 'react-native';
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
     * Mostrar layout luego de cargar los componentes
     */
    if (this.state.loading) {
      return (<View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color='blue' /></View>);
    }
    var height = Dimensions.get('window').height;
    return (
      <Container>
        <Expo.LinearGradient colors={['#8baaaa', '#ae8b9c']} style={{ flex: 1}} start={[0.01,0.01]} end={[0.99,0.99]}>
          <Header transparent style={{paddingTop: 20}}>
          <Left/>          
          <Body>
            <Title>Inicio</Title>
          </Body>
          <Right />
          </Header>
          <Content style={{ marginTop: 5}}>
            <KeyboardAvoidingView behavior="padding" enabled>
              <Form>
                  <Item rounded style={styles.form}>
                    <Icon active ios='ios-person' android='md-person' style={{color: 'white'}}/>
                    <Input placeholder='Correo' placeholderTextColor='#ddd' defaultValue="ne.ko@hotmail.es" onChangeText={(text) => this.setState({email: text})} keyboardType='email-address' autoCapitalize='none'  style={{color: 'white'}}/>
                  </Item>
                  <Item rounded style={styles.form}>
                    <Icon active ios='ios-lock' android='md-lock'  style={{color: 'white'}}/>
                    <Input placeholder='Contraseña' placeholderTextColor='#ddd' defaultValue="123456" secureTextEntry={true}  onChangeText={(text) => this.setState({password: text})} autoCapitalize='none'  style={{color: 'white'}}/>
                  </Item>
                <Item rounded style={styles.form}>
                  <Body>
                    <Button success rounded block onPress={() => this._OnLogin(this.props.handler)}>
                      <Text>Iniciar Sesión</Text>
                    </Button> 
                  </Body>
                </Item>              
              </Form>
            </KeyboardAvoidingView>
          </Content>
        </Expo.LinearGradient>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  form: {
    borderColor: 'rgba(255,255,255,0)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10
  },
});