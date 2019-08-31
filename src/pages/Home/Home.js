/**
 * @author Enrique Henriquez Figueroa
 * @copyright Binar10
 */
import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Text, Icon, Button, Tabs, Tab, TabHeading, Drawer } from 'native-base';
import { View, AsyncStorage, Image } from 'react-native';
import IconStyles from '../../styles/Icons';
import Activos from './Tabs/Activos';
import Completados from './Tabs/Completados';
import { COLOR } from '../../components/Colores';
import SideBar from '../SideBar';
import { api } from '../../services/api';
import { UserInfo } from '../../components/UserInfo';
import { toastr } from '../../components/Toast';
import { Imagen } from '../../components/Imagenes';

let user = [];
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      showToast: false,
      estado: true
    };
    let token = this.props.token;
    this._retrieveData = this._retrieveData.bind(this);
    this.closeDrawer = this.closeDrawer.bind(this);
    this._retrieveData();
    this.LogReportes();
    console.ignoredYellowBox = ['Require cycle:'];
  }

  /**
   * Guardar datos de la cantidad de reportes sin leer
   */
  _storeData = async (cant) => {
    try {
      await AsyncStorage.setItem('CANT_REPORTES',''+cant);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Obtener Estado del supervisor
   */
  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('ESTADO');
      if (value !== null) {
        this.setState({estado : value});
      }
    } catch (error) {
      console.log(error);
    }
  }

  async componentWillMount() {
    this.getProfile();
  }  
  
  /**
   * Obtener los datos del usuario
   */
  async getProfile()
  {
    let handler2 = false;
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    await fetch(api.ipProfileUser, {
      method: 'GET',
      headers: {
          'Authorization': auth,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept':'application/json'
      },
      body: ''
    }).then(function(response) {
      //console.log(response);
      newToken = JSON.parse(response._bodyInit);
      //console.log(newToken);
      if(response.ok === true && response.status === 200)
      {
        user = newToken;
      }
      else
      {
        console.log(response);
        if(response.status === 500){
          toastr.showToast('Error con el servidor','danger');
        }
        else if(response.status === 401){
          toastr.showToast('Su sesión expiró','danger');
          user = {};
          handler2 = true;
        }
        else{
          //toastr.showToast(newToken[actividades],'warning');
        }
      }
      //return response.json();
    }).catch(function(error){
      toastr.showToast('Su sesión expiró','danger');
      handler2 = true;
      console.log(error);
    });
    if(!handler2){
      this.setState({ loading: false });
    }
    else{this.props.handler2(-1,token,[]);}
  }

  async LogReportes(){
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    var logs = [];
    var that = this;
    await fetch(api.ipLogNotificacionesUsuario, {
      method: 'GET',
      headers: {
          'Authorization': auth,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept':'application/json'
      },
      body: ''
    }).then(function(response) {
      //console.log(response);
      newToken = JSON.parse(response._bodyInit);
      //console.log(newToken["message"]);
      if(response.ok === true && response.status === 200)
      {
        logs = newToken["message"];
        logs.forEach(element => {
          if(element.leido === 0){
            //console.log(element);
            Expo.Notifications.dismissAllNotificationsAsync();
            Expo.Notifications.presentLocalNotificationAsync({title:'Nuevo mensaje en el reporte:',body:element.nombre_plan,ios:{sound:true},android:{icon:api.ipIcons + 'icono192.png'}}).then(function(response){
              //console.log(response)
            })
          }
        })
        var cant = logs.filter((element,index) => element.leido === 0).length;
        that._storeData(cant);
      }
      else
      {
        console.log(response);
        var newToken = JSON.parse(response._bodyInit);
        var header = JSON.stringify({ok:response.ok, status:response.status, statusText:response.statusText, type:response.type, url:response.url});
        var body = JSON.stringify({message:newToken.message,exception:newToken.exception,file:newToken.file,line:newToken.line});
        if(response.status === 500){
          logError.sendError(header,body,auth);
          toastr.showToast('Error con el servidor','danger');
        }
        else if(response.status === 401){
          // toastr.showToast('Su sesión expiró','danger');
        }
        else{
          //toastr.showToast(newToken[actividades],'warning');
        }
      }
      //return response.json();
    }).catch(function(error){
      toastr.showToast('Su sesión expiró','danger');
      console.log(error);
    });

    localNotification = setTimeout(function () {
      that.LogReportes();
    }, 60000);
  }

  /**
   * cerrar SideBar
   */
  closeDrawer(){
    this.drawer._root.close();
  }


  render() {
    return (
      <Drawer
        ref={(ref) => { this.drawer = ref; }}
        content={<SideBar handler={this.props.handler} handler2={this.props.handler2} layout={1} rol={user.id_rol} token={token} data={this.props.data} indexArray={this.props.indexArray} _retrieveData={this._retrieveData} closeDrawer={this.closeDrawer}/>}
        onClose={() => this.drawer._root.close()} 
        initializeOpen={false}
        openDrawerOffset={0}
        panOpenMask={.05}
        panCloseMask={.02}
        styles={{ drawer: { shadowColor: "#000000",shadowOpacity: 0,shadowRadius: 0,elevation: 5,},mainOverlay:{opacity: 0,backgroundColor:'#00000000', elevation:8}}}
        >
        <Container>
          <Expo.LinearGradient
            colors={['#FD0047', '#FDBB01']}
            start={[0,.5]}
            end={[1,.5]}
            style={IconStyles.gradient}>
            <Header hasTabs style={IconStyles.navbar}>
                <Left>
                    <Button transparent onPress={() => {this.drawer._root.open()}}>
                      {/* <Icon ios="ios-menu" android="md-menu" style={IconStyles.menu}></Icon> */}
                      <Image style={IconStyles.menu2} source={Imagen.home}></Image>
                    </Button>
                </Left>          
                <Body>
                  {/*<Title>Actividades</Title>*/}
                </Body>
            </Header>
          </Expo.LinearGradient>
          <UserInfo handler2={this.props.handler2} user={user} estado={this.state.estado}></UserInfo>
          <Tabs tabContainerStyle={{elevation:0, shadowOpacity:0}} tabBarUnderlineStyle={{backgroundColor:'transparent',elevation:0, shadowOpacity:0}}>
            <Tab style={{backgroundColor: '#fff'}} heading={ <TabHeading activeTextStyle={{color:'#ff0000'}} style={{backgroundColor: '#fff'}}><View style={{backgroundColor:COLOR.azul, flex:.95, borderRadius: 10, justifyContent: 'center', alignItems: 'center',marginLeft:10}}><Text style={{marginTop:10, marginBottom:10,fontFamily:'BebasNeueBold', fontWeight:'normal', fontSize:20}}>Activos</Text></View></TabHeading>}>
              <Activos handler2={this.props.handler2} token={token} data={this.props.data} estado={this.state.estado}/>
            </Tab>
            <Tab style={{backgroundColor: '#fff'}} heading={ <TabHeading style={{backgroundColor: '#fff'}}><View style={{backgroundColor:COLOR.azul, flex:.95, borderRadius: 10, justifyContent: 'center', alignItems: 'center',marginRight:10}}><Text style={{marginTop:10, marginBottom:10,fontFamily:'BebasNeueBold', fontWeight:'normal', fontSize:20}}>Completados</Text></View></TabHeading>}>
              <Completados handler2={this.props.handler2} token={token} data={this.props.data} estado={this.state.estado}/>
            </Tab>
          </Tabs>
        </Container>
      </Drawer>
    );
  }
}