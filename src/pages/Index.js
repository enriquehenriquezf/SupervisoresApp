import React, { Component } from 'react';
import { Root, Spinner } from 'native-base';
import { View } from 'react-native';
import * as Expo from 'expo';
import Login from './Login';
import Home from './Home/Home';
import Activity from './Activity';
import Profile from './Profile';
import ChangePass from './ChangePass';
import ShowSucursales from './ShowSucursales';
import ShowActivities from './ShowActivities';
import Stats from './Stats';
import Reportes from './Reportes';
import SoporteTecnico from './SoporteTecnico';
import {api} from '../services/api'
import { Imagen } from '../components/Imagenes';

export default class Index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      index: 0,
      token: null,
      data: null,
      indexArray: 0,
      loading: true,
      loading2: false,
    }
    this.handler = this.handler.bind(this);
    this.handler2 = this.handler2.bind(this);
    this._OnLogout = this._OnLogout.bind(this);
    console.ignoredYellowBox = ['Setting a timer', 'Require cycle:'];
    console.ignoredYellowBox = ['Require cycle:'];
  }

  /***
   * cambiar el valor del layout a mostrar.
   * @param {int} index indice del layout
   * @example 0 = login, 1 = home, 2 = Activity, 3 = Show Sucursales, 4 = ShowActivities
   */
  switchScreen(index) {
      this.setState({index: index})
  }

  /***
   * Cargar tipos de fuentes antes de mostrar el layout.
   */
  async componentWillMount() {
    try{
      await Expo.Font.loadAsync({
        Roboto: require("native-base/Fonts/Roboto.ttf"),
        Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
        BebasNeueBold: require('../../assets/Fonts/BebasNeueBold.ttf'),
        BebasKai: require('../../assets/Fonts/BebasKai.ttf'),
      });
      await Expo.Asset.loadAsync([
        Imagen.unidrogas,
        Imagen.home,
        Imagen.actividad,
        Imagen.perfil,
        Imagen.agenda,
        Imagen.activo,
        Imagen.inactivo,
        Imagen.reportes,
        Imagen.servicioTecnico,
        Imagen.cerrarSesion,
        Imagen.user,
        Imagen.pass,
        Imagen.back,
        Imagen.phone,
        Imagen.mail,
        Imagen.code,
        Imagen.find,
        Imagen.check,
        Imagen.uncheck,
        Imagen.equis,
        Imagen.profileBorder,
        Imagen.tuto1,
        Imagen.tuto2
      ]);
    }catch(error){console.log(error)}
    this.setState({ loading: false });
  }

  /**
   * Elimina el token
   */
  async _OnLogout(){
    let bodyInit = JSON.parse(this.state.token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    await fetch(api.ipLogout, {
      method: 'POST',
      headers: {
          'Authorization': auth,
          'Content-Type': 'application/json',
          'Accept':'application/json'
      },      
      body: ''
    }).then(function(response) {
      //console.log(response);
      if(response.ok === true && response.status === 200)
      {
        var token2 = JSON.parse(response._bodyInit)
        console.log(token2["message"]);
      }
      else{
        if(response.status === 401){
          var token2 = JSON.parse(response._bodyInit)
          console.log(token2["message"]);
        }
      }
    }).catch(function(error){
      console.log(error);
    });   
  }

  /***
   * Obtiene el token y un valor de un layout para cargar otro layout
   * @param {int} index valor del layout al cual se quiere acceder
   * @param token token obtenido de otro layout
   * @param {Array} data datos del plan de trabajo seleccionado
   */
  handler2(index,token,data) {
    this.setState({token: token, data: data})
    this.switchScreen(index);
  }
  /***
   * Obtiene el token y un valor de un layout para cargar otro layout
   * @param {int} index valor del layout al cual se quiere acceder
   * @param token token obtenido de otro layout
   */
  handler(index,token) {
    this.setState({token: token})
    this.switchScreen(index);
  }
  /***
   * Obtiene un valor de un layout para cargar otro layout
   * @param {int} index valor del layout al cual se quiere acceder
   */
  handler(index) {
    this.switchScreen(index);
  }

  render() {
    /***
     * mostrar un spinner mientras la aplicación carga.
     */
    if (this.state.loading) {
      return (<View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color='blue' /><Expo.AppLoading /></View>);
    }
    let AppComponent = null;

    /***
     * verificar el layout que se va a mostrar.
     */
    if (this.state.index == 0) {
      AppComponent = Login
    } else if(this.state.index == 1){
      AppComponent = Home
    } else if(this.state.index == 2){
      AppComponent = Activity
    } else if(this.state.index == 3){
      AppComponent = ShowSucursales
    } else if(this.state.index == 4){
      AppComponent = ShowActivities
    } else if(this.state.index == 5){
      AppComponent = Profile
    } else if(this.state.index == 6){
      AppComponent = ChangePass
    } else if(this.state.index == 7){
      AppComponent = Stats
    } else if(this.state.index == 8){
      AppComponent = Reportes
    } else if(this.state.index == 9){
      AppComponent = SoporteTecnico
    } else if(this.state.index == -1){
      this._OnLogout();
      AppComponent = Login
    }
    return (
      <Root>
        <AppComponent 
        handler={this.handler} handler2={this.handler2}
        token={this.state.token} 
        data={this.state.data} 
        indexArray={this.state.indexArray} 
        >
        </AppComponent>
      </Root>
    );
  }
}