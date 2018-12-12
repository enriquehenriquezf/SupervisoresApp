import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, Form, Item, Input,Text, Button, Toast, Icon, Spinner, H1 } from 'native-base';
import { CheckBox } from 'react-native-elements';
import {View, Dimensions, KeyboardAvoidingView, AsyncStorage, Platform } from 'react-native';
import styles from '../styles/Login';
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
  // email de prueba: ne.ko@hotmail.es    pass de prueba: 123456
  constructor(props) {
    super(props);
    this.state = {
      email: '', 
      password: '',
      loading: true,
      error:null,
      checked:true,
      showToast: false
    };
    this._OnLogin = this._OnLogin.bind(this);
    let token = null;
  }

  async componentWillMount() {
    this._retrieveData();
    this.setState({ loading: false });
  }
  /**
   * Verificar credenciales de inicio de sesión
   * @param {function} handler Obtiene el token y un valor de un layout para cargar otro layout
   */
  _OnLogin(handler){
    let username = this.state.email;
    let pass = this.state.password;
    this._storeData();
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
      console.log(error);
      toastr.showToast('Verifique su conexión a internet','warning');
    });
  }

  /**
   * Guardar datos de usuario y contraseña en los datos globales de la aplicación
   */
  _storeData = async () => {
    if(this.state.checked){
      try {
        await AsyncStorage.multiSet([['USER', this.state.email],['PASS', this.state.password]]);
      } catch (error) {
        console.log(error);
      }
    }
    else{
      try {
        await AsyncStorage.multiRemove(['USER', 'PASS']);
      } catch (error) {
        console.log(error);
      }
    }
  }

  /**
   * Obtener datos de usuario y contraseña guardados en los datos globales de la apicación y enviarlos en los inputs correspondientes
   */
  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.multiGet(['USER','PASS']);
      if (value !== null) {
        //console.log(value);
        this.setState({ email: value[0][1] , password: value[1][1]});
      }
    } catch (error) {
      console.log(error);
    }
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
        <Expo.LinearGradient colors={['#00CDAC','#02AAB0']} style={{ flex: 1}} start={[0.01,0.01]} end={[0.99,0.99]}>{/* ['#8baaaa', '#ae8b9c'] ['#37ecba', '#72afd3'] ['#2af598','#009efd'] ['#00CDAC','#02AAB0'] ['#5A288E','#02AAB0']*/}
          <Header transparent style={{paddingTop: 20}}>
          <Left/>          
          <Body>
            <H1 style={{color: '#FFF'}}>Inicio</H1>
          </Body>
          <Right />
          </Header>
          <KeyboardAvoidingView behavior="padding" enabled style={{flex: Platform.OS === 'ios' ? 0.7 : 1}}>
            <Content style={{ marginTop: 5}}>
              <Form style={{paddingTop:height/4}}>
                <Item regular style={styles.form}>
                  <Icon active ios='ios-person' android='md-person' style={styles.icon}/>
                  <Input placeholder='Correo' placeholderTextColor='#f0f0f0' defaultValue={this.state.email} onChangeText={(text) => this.setState({email: text})} keyboardType='email-address' autoCapitalize='none'  style={styles.input}/>
                </Item>
                <Item regular style={styles.form}>
                  <Icon active ios='ios-lock' android='md-lock'  style={styles.icon}/>
                  <Input placeholder='Contraseña' placeholderTextColor='#f0f0f0' defaultValue={this.state.password} secureTextEntry={true}  onChangeText={(text) => this.setState({password: text})} autoCapitalize='none'  style={styles.input}/>
                </Item>
                <CheckBox center containerStyle={styles.checkbox} textStyle={{color: '#fff'}} title='Recordar Contraseña' checked={this.state.checked} onPress={() => this.setState({checked: !this.state.checked})}/>
                <Item regular style={styles.boton}>
                  <Body>
                    <Button success regular block onPress={() => this._OnLogin(this.props.handler)} style={styles.boton2}>
                      <Text style={styles.text}>Iniciar Sesión</Text>
                    </Button> 
                  </Body>
                </Item>          
              </Form>
            </Content>
          </KeyboardAvoidingView>
        </Expo.LinearGradient>
      </Container>
    );
  }
}