import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, Text, Icon, Button, Spinner, H2, Item, Thumbnail, ActionSheet } from 'native-base';
import styles from '../styles/Profile';
import IconStyles from '../styles/Icons';
import {toastr} from '../components/Toast';
import {api} from '../services/api';
import {Imagen} from '../components/Imagenes';
import {View, BackHandler, AsyncStorage, TouchableHighlight} from 'react-native';

var BUTTONS = [
  { text: "Activo", icon: "checkmark-circle", iconColor: "#5cb85c" },
  { text: "Inactivo", icon: "remove-circle", iconColor: "#d9534f" },
  { text: "Cerrar", icon: "close-circle", iconColor: "#fa213b" }
];
var CANCEL_INDEX = 2;
let items = null;
export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      showToast: false,
      estado : true
    };
    let token = this.props.token;
    items = this.props.data;
    this._retrieveData();
    this.ChangePass = this.ChangePass.bind(this);
    console.ignoredYellowBox = ['Require cycle:'];
  }

  async componentWillMount() {
    //console.log(items);
    this.setState({ loading: false });
  }

  componentDidMount()
  {
    //console.log(items);
    /** Agregar el metodo handleBackPress al evento de presionar el boton "Back" de android */
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  }

  componentWillUnmount() {
    /** Eliminar la funcion para el evento de Back Press */
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  /**
   * Retornar al Home
   */
  handleBackPress = () => {
    this.props.handler2(1,token,[]);
    return true;
  }

  /**
   * Enviar correo de cambio de contraseña e ir al layout de cambio de contraseña
   */
  ChangePass(handler)
  {
    fetch(api.ipChangePassword, {
      method: 'POST',
      headers: {
          'Authorization': 'Access',
          'Content-Type': 'application/json',
          'Accept':'application/json'
      },
      body: JSON.stringify({email: items.correo})
      }).then(function(response) {
        console.log(response);
        if(response.ok === true)
        {
          toastr.showToast(JSON.parse(response._bodyInit),'success');
          handler(6,token,items);
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
        //return response.json();
      }).catch(function(error){
        console.log(error);
      });
  }

  /**
   * Guardar estado del supervisor (Activo/Inactivo)
   */
  _storeData = async (estado2) => {
    try {
      var state = '';
      this.setState({estado: estado2});
      var time =  new Date().getTime().toString();
      if(estado2){
        state = 'true';
        await AsyncStorage.multiSet([['ESTADO', state],['TIME_INACTIVO',time]]);
      }else{
        state='false';
        await AsyncStorage.multiSet([['ESTADO', state],['TIME_INACTIVO_INIT',time]]);
        await AsyncStorage.removeItem('TIME_INACTIVO');
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Obtener Estado del supervisor
   */
  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.multiGet(['ESTADO','TIME_INACTIVO','TIME_INACTIVO_INIT']);
      var state;
      if (value !== null) {
        if(value[0][1] === 'true'){state=true}
        else{state=false}
        this.setState({estado: state});
        //console.log('TIME_INACTIVO: ' + value[1][1]);
        //console.log('TIME_INACTIVO_INIT: ' + value[2][1]);
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Cambia el estado de Activo o Inactivo
   */
  CambiarEstado(){
    ActionSheet.show(
      {
        options: BUTTONS,
        cancelButtonIndex: CANCEL_INDEX,
        title: "Estado"
      },
      buttonIndex => {
        var state;
        if(buttonIndex !== 2){
          if(buttonIndex === 0){
            state = true;
          }
          else if(buttonIndex === 1){state = false;}
          //this.setState({ estado: state });
          if(this.state.estado !== state){
            this._storeData(state);
          }   
        }
      }
    );
  }

  render() {
    /***
     * Mostrar layout luego de cargar los datos
     */
    if (this.state.loading) {
      return (<View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color='blue' /></View>);
    }
    return (
      <Container>
        <Expo.LinearGradient colors={['#0277BD','#FFF', '#FFF']} style={{ flex: 1}} start={[0.5,0.01]} end={[0.5,0.99]}>
        <Header style={{paddingTop: 20}}>
        <Left>
            <Button transparent style={IconStyles.back} onPress={() => this.props.handler2(1,token,[])}>
              <Icon ios="ios-arrow-back" android="md-arrow-back" style={IconStyles.header}></Icon>
            </Button>
        </Left>          
        <Body>
          <Title>Perfil</Title>
        </Body>
        <Right>
          {
            this.state.estado === true ?
              <TouchableHighlight onPress={() => this.CambiarEstado()}>
                <View style={IconStyles.estado}>
                  <Icon active ios='ios-checkmark-circle' android='md-checkmark-circle' style={IconStyles.activo}/>
                  <Title style={IconStyles.StateTitle}>Activo</Title>
                  <Icon active ios='ios-arrow-dropdown' android='md-arrow-dropdown' style={IconStyles.dropdown}/>
                </View>
              </TouchableHighlight>
            :
              <TouchableHighlight onPress={() => this.CambiarEstado()}>
                <View style={IconStyles.estado}>
                  <Icon active ios='ios-remove-circle' android='md-remove-circle' style={IconStyles.inactivo}/>
                  <Title style={IconStyles.StateTitle}>Inactivo</Title>
                  <Icon active ios='ios-arrow-dropdown' android='md-arrow-dropdown' style={IconStyles.dropdown}/>
                </View>
              </TouchableHighlight>
          }
        </Right>
        </Header>
          <Content>
            <View style={{marginTop: 10, marginLeft:'auto', marginRight:'auto'}}>
                <Thumbnail large
                source={{uri: Imagen.avatar2}}
                style={{marginLeft:'auto', marginRight:'auto', borderWidth:4, borderColor:'#FFF', width: 160, height: 160, borderRadius:80}}
                />
                <H2 style={{margin: 5, marginLeft:'auto', marginRight:'auto'}}>{items.nombre} {items.apellido}</H2>
                <Item style={{borderBottomColor: '#039BE5'}}>
                    <Icon ios="ios-card" android="md-card" style={{color: '#039BE5'}}></Icon>
                    <Text style={styles.text}>cedula: </Text>
                    <Text>{items.cedula}</Text>
                </Item>
                <Item style={{borderBottomColor: '#039BE5'}}>
                    <Icon ios="ios-code" android="md-code" style={{color: '#039BE5'}}></Icon>
                    <Text style={styles.text}>codigo: </Text>
                    <Text>{items.codigo}</Text>
                </Item>
                <Item style={{borderBottomColor: '#039BE5'}}>
                    <Icon ios="ios-mail" android="md-mail" style={{color: '#039BE5'}}></Icon>
                    <Text style={styles.text}>correo: </Text>
                    <Text>{items.correo}</Text>
                </Item>
                <Item style={{borderBottomColor: '#039BE5'}}>
                    <Icon ios="ios-phone-portrait" android="md-phone-portrait" style={{color: '#039BE5', marginLeft:5}}></Icon>
                    <Text style={styles.text}>  tels:     </Text>
                    <Text>{items.telefono}</Text>
                </Item>
                <Button info regular block style={styles.boton} onPress={() => this.ChangePass(this.props.handler2)}><Text> Cambiar Contraseña </Text></Button>
                <Button danger regular block style={styles.boton} onPress={() => this.props.handler2(-1,token,[])}><Text> Cerrar Sesión </Text></Button>
            </View>
          </Content>
          </Expo.LinearGradient>
      </Container>
    );
  }
}