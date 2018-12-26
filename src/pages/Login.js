import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, Form, Item, Input,Text, Button, Icon, Spinner, H1, CheckBox, ListItem } from 'native-base';
import {toastr} from '../components/Toast';
import {View, Dimensions, KeyboardAvoidingView, AsyncStorage, Platform, Image } from 'react-native';
import styles from '../styles/Login';
import {api} from '../services/api'

let fail = 0;
let swChange = false;
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
    this.ChangePass = this.ChangePass.bind(this);
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
    fetch(api.ipLogin, {
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
        fail = 0;
        handler(1,token);
        toastr.showToast('Ha iniciado sesión!','success');
      }
      else
      {
        toastr.showToast('Credenciales incorrectas','danger');
        fail += 1;
      }
      return response.json();
    }).catch(function(error){
      console.log(error);
      toastr.showToast('Verifique su conexión a internet','warning');
      if(error.toString().includes('Network request failed')){toastr.showToast('Contactese con el administrador','warning');}
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

  /**
   * Enviar correo de cambio de contraseña e ir al layout de cambio de contraseña
   */
  ChangePass(handler)
  {
    var items = null;
    var correo = this.state.email;
    if(!swChange){
      swChange = true;
      fetch(api.ipChangePassword, {
        method: 'POST',
        headers: {
            'Authorization': 'Access',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email: correo})
      }).then(function(response) {
        //console.log(response);
        if(response.ok === true)
        {
          items = {correo: correo, nombre: '', apellido: '', FromLogin:true};
          //console.log(items);
          toastr.showToast(JSON.parse(response._bodyInit),'success');
          fail = 0;
          handler(6,null,items);
          swChange = false;
        }
        else{toastr.showToast('Error al enviar el correo','danger');}
        return response.json();
      }).catch(function(error){
        console.log(error);
      });
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
        <Expo.LinearGradient colors={['#29B6F6','#039BE5']} style={{ flex: 1}} start={[0.01,0.01]} end={[0.99,0.99]}>{/* ['#8baaaa', '#ae8b9c'] ['#37ecba', '#72afd3'] ['#2af598','#009efd'] ['#00CDAC','#02AAB0'] ['#5A288E','#02AAB0'] ['#29B6F6','#039BE5']*/}
          <Header transparent style={{paddingTop: 20}}>
          <Left/>          
          <Body>
            <H1 style={{color: '#FFF'}}>Inicio</H1>
          </Body>
          <Right />
          </Header>
          <KeyboardAvoidingView behavior="padding" enabled style={{flex: Platform.OS === 'ios' ? 0.7 : 1}}>
            <Content style={{ marginTop: 5}}>
              {/*<Image style={{height: 139, width: 135, marginLeft: 'auto', marginRight:'auto', marginBottom: -(height/4)}} 
                source={require('../../assets/unidrogas.png')}/> */}
              <Form style={{paddingTop:height/4}}>
                <Item regular style={styles.form}>
                  <Icon active ios='ios-person' android='md-person' style={styles.icon}/>
                  <Input placeholder='Correo' placeholderTextColor='#f0f0f0' defaultValue={this.state.email} onChangeText={(text) => this.setState({email: text})} keyboardType='email-address' autoCapitalize='none'  style={styles.input}/>
                </Item>
                <Item regular style={styles.form}>
                  <Icon active ios='ios-lock' android='md-lock'  style={styles.icon}/>
                  <Input placeholder='Contraseña' placeholderTextColor='#f0f0f0' defaultValue={this.state.password} secureTextEntry={true}  onChangeText={(text) => this.setState({password: text})} autoCapitalize='none'  style={styles.input}/>
                </Item>
                {/*<CheckBox center containerStyle={styles.checkbox} textStyle={{color: '#fff'}} title='Recordar Credenciales' checked={this.state.checked} onPress={() => this.setState({checked: !this.state.checked})}/>*/}
                <ListItem underlayColor='#29B6F6' style={styles.checkbox2} button onPress={() => this.setState({checked: !this.state.checked})}>
                  <CheckBox color='#5cb85c' checked={this.state.checked} onPress={() => this.setState({checked: !this.state.checked})}/>
                  <Body>
                    <Text style={{color:'white'}}>Recordar Credenciales</Text>
                  </Body>
                </ListItem>
                {fail >= 1 && <Text style={styles.forgotPass} onPress={() => this.ChangePass(this.props.handler2)}>Olvidaste tu contraseña?</Text>}
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