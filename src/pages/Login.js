import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Content, Form, Item, Input,Text, Button, Icon, Spinner, CheckBox, ListItem } from 'native-base';
import {toastr} from '../components/Toast';
import {View, Dimensions, KeyboardAvoidingView, AsyncStorage, Platform, Image, ScrollView } from 'react-native';
import styles from '../styles/Login';
import {api} from '../services/api';
import {Imagen} from '../components/Imagenes';
import { COLOR } from '../components/Colores';
import Overlay from 'react-native-modal-overlay';

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
      estado:true,
      privacidad:'0',
      tutorial:'0',
      isVisiblePrivacidad:false,
      politicas: 'El Responsable del Tratamiento, adopta las medidas necesarias para garantizar la seguridad, integridad y confidencialidad de los datos conforme a lo dispuesto en el Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de 2016,  relativo  a  la  protección  de  las  personas  físicas  en  lo  que  respecta  al  tratamiento  de  datos  personales  y  a  la  libre circulación de los mismos. Si  bien  el  Responsable,  realiza  copias  de  seguridad  de  los  contenidos  alojados  en  sus  servidores,  sin  embargo  no  se responsabiliza de la pérdida o el borrado accidental de los datos por parte de los Usuarios. De igual manera, no garantiza la  reposición  total  de  los  datos  borrados  por  los  Usuarios,  ya  que los  citados  datos  podrían  haber  sido  suprimidos  y/o modificados durante el periodo de tiempo transcurrido desde la última copia de seguridad. Los  servicios  facilitados  o  prestados  a  través  de  la  Aplicación, excepto  los  servicios  específicos  de  backup,  no  incluyen  la reposición de los contenidos conservados en las copias de seguridad realizadas por el Responsable del Tratamiento, cuando esta  pérdida  sea  imputable  al  usuario;  en  este  caso,  se  determinará  una  tarifa  acorde  a  la  complejidad  y  volumen  de  la recuperación,  siempre  previa  aceptación  del  usuario.  La  reposición  de  datos  borrados  sólo  está  incluida  en  el  precio  del servicio cuando la pérdida del contenido sea debida a causas atribuibles al Responsable.',
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
    var that = this;
    fetch(api.ipLogin, {
    method: 'POST',
    headers: {
        'Authorization': 'Access',
        'Content-Type': 'application/json',
        'Accept':'application/json'
    },
    body: JSON.stringify({username: username, password: pass})
    }).then(function(response) {
      //console.log(response);
      if(response.ok === true)
      {
        token = response;
        fail = 0;
        that.getPorcentaje(token,handler);
        toastr.showToast('Ha iniciado sesión!','success');
      }
      else
      {
        console.log(response);
        if(response.status === 500){
          toastr.showToast('Error con el servidor','danger');
        }
        else{
          toastr.showToast('Credenciales incorrectas','danger');
          fail += 1;
        }
      }
      return response.json();
    }).catch(function(error){
      console.log(error);
      toastr.showToast('Verifique su conexión a internet','warning');
      if(error.toString().includes('Network request failed')){toastr.showToast('Contactese con el administrador','warning');}
    });
  }

  /**
   * Obtener cantidad de las actividades (activas, completas, noRealizadas)
   */
  async getPorcentaje(token2,handler){
    let bodyInit = JSON.parse(token2._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    var that = this;
    await fetch(api.ipPorcentajeActividades, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
        'Accept':'application/json'
      },
      body: ''
      }).then(function(response) {
        //console.log(response);
        if(response.ok === true)
        {
          var porcentajes = JSON.parse(response._bodyInit);
          var general = (porcentajes.porcentaje_general.actividades_completas / porcentajes.porcentaje_general.todas_las_actividades) * 100;
          that._storeDataPorcentajes(Math.floor(general),porcentajes);
          handler(1,token);
          //console.log(Math.floor(general));
        }
        else
        {
          console.log(response);
          if(response.status === 500){
            toastr.showToast('Error con el servidor','danger');
          }
          else if(401){
            handler(8,token);
            //toastr.showToast('Credenciales incorrectas','danger');
          }
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
        await AsyncStorage.multiSet([['USER', this.state.email],['PASS', this.state.password],['PRIVACIDAD',this.state.privacidad]]);
      } catch (error) {
        console.log(error);
      }
    }
    else{
      try {
        await AsyncStorage.multiRemove(['USER', 'PASS']);
        await AsyncStorage.setItem('PRIVACIDAD',this.state.privacidad);
      } catch (error) {
        console.log(error);
      }
    }
  }

  /**
   * Guardar datos de cantidad de actividades
   */
  _storeDataPorcentajes = async (general,porcentajes) => {
    try {
      await AsyncStorage.multiSet([['PORCENTAJE', ''+general],['PORCENTAJES', JSON.stringify(porcentajes)],['ESTADO',this.state.estado]]);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Obtener datos de usuario y contraseña guardados en los datos globales de la apicación y enviarlos en los inputs correspondientes
   */
  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.multiGet(['USER','PASS','ESTADO','PRIVACIDAD','TUTORIAL']);
      if (value !== null) {
        //console.log(value);
        var state = 'true';
        var priv = false;
        if(value[2][1] !== null){if(value[2][1] === 'false'){state='false'}}
        if(value[3][1] !== '2' || value[3][1] === null){priv = true}
        this.setState({ email: value[0][1] , password: value[1][1], estado: state, privacidad:value[3][1],tutorial:value[4][1], isVisiblePrivacidad:priv});
      }
      else{
        this.setState({privacidad:'0', tutorial:'0', isVisiblePrivacidad:true})
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
            'Content-Type': 'application/json',
            'Accept':'application/json'
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
        else
        {
          console.log(response);
          if(response.status === 500){
            toastr.showToast('Error con el servidor','danger');
          }
          else{
            toastr.showToast('Error al enviar el correo','danger');
          }
        }
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
        <KeyboardAvoidingView behavior="padding" enabled style={{flex: Platform.OS === 'ios' ? 0.8 : 1}}>
          <Content contentContainerStyle={{ justifyContent: 'center', flex: 1 }}>
            <View>
              <Image style={{height: 139, width: 135, marginLeft: 'auto', marginRight:'auto', marginBottom: -(height/5)}} source={Imagen.unidrogas}/>
              <Form style={{paddingTop:height/4}}>
                <Item regular style={styles.form}>
                  {/*<Icon active ios='ios-person' android='md-person' style={styles.icon}/>*/}
                  <Image style={styles.icon} source={Imagen.user}/>
                  <Input placeholder='Correo' placeholderTextColor={COLOR.gris} defaultValue={this.state.email} onChangeText={(text) => this.setState({email: text})} keyboardType='email-address' autoCapitalize='none'  style={styles.input}/>
                </Item>
                <Item regular style={styles.form}>
                  {/*<Icon active ios='ios-lock' android='md-lock'  style={styles.icon}/>*/}
                  <Image style={styles.icon} source={Imagen.pass}/>
                  <Input placeholder='Contraseña' placeholderTextColor={COLOR.gris} defaultValue={this.state.password} secureTextEntry={true}  onChangeText={(text) => this.setState({password: text})} autoCapitalize='none'  style={styles.pass}/>
                </Item>
                
                {fail >= 1 && <Text style={styles.forgotPass} onPress={() => this.ChangePass(this.props.handler2)}>Olvidaste tu contraseña?</Text>}              
                <Button block onPress={() => this._OnLogin(this.props.handler)} style={styles.boton2}>
                  <Text style={styles.text}>Ingresar</Text>
                </Button>
                <ListItem underlayColor={COLOR.azul} style={styles.checkbox2} button onPress={() => this.setState({checked: !this.state.checked})}>
                  <CheckBox color={COLOR.azul} checked={this.state.checked} onPress={() => this.setState({checked: !this.state.checked})}/>
                  <Body>
                    <Text style={styles.checkbox}>Recordar Credenciales</Text>
                  </Body>
                </ListItem>        
              </Form>
            </View>
          </Content>
        </KeyboardAvoidingView>
        <Overlay
          visible={this.state.isVisiblePrivacidad}
          animationType="zoomIn"
          closeOnTouchOutside={false}
          onClose={() => this.setState({isVisiblePrivacidad: true})}
          containerStyle={{backgroundColor: "rgba(0, 0, 0, .8)", width:"auto",height:"auto"}}
          childrenWrapperStyle={{backgroundColor: "rgba(255, 255, 255, 1)", borderRadius: 10,padding:10,paddingTop:20,paddingBottom:20}}
        >
          <View style={{justifyContent:'space-between', width:"100%"}}>
            <ScrollView>
              {
                //FIXME: arreglar scroll
              }
              <Text style={{fontFamily:'BebasKai', paddingHorizontal:20}}>{this.state.politicas}</Text>
              <Button style={{backgroundColor:COLOR.verde}} onPress={() => {this.setState({isVisiblePrivacidad: false, privacidad:'2'})}}>
                <Text>Aceptar</Text>
              </Button>
            </ScrollView>
          </View>
        </Overlay>
      </Container>
    );
  }
}