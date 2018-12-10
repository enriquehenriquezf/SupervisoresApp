import * as Expo from 'expo';
import React, { Component } from 'react';
import { Left, Body, Right, Content, List,ListItem,Text, Toast, Badge, Icon, Thumbnail, Spinner } from 'native-base';
import {View, Platform, RefreshControl} from 'react-native';
import {ipHome} from '../../../services/api'

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

let items = [];
let user = [];
let sucursalActual = null;
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
      showToast: false
    };
    let token = this.props.token;
    let newToken = null;
    items = [];
    this._OnItemPress = this._OnItemPress.bind(this);
    console.ignoredYellowBox = ['Require cycle:'];
  }

  async componentWillMount() {
    this.getPlanesDeTrabajo();
  }
  /**
   * Leer las actividades a realizar durante el día actual.
   */
  async getPlanesDeTrabajo()
  {
    this.setState({ refreshing: true });
    items = [];
    let handler2 = false;
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    await fetch(ipHome, {
      method: 'GET',
      headers: {
          'Authorization': auth,
          'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: ''
    }).then(function(response) {
      //console.log(response);
      newToken = JSON.parse(response._bodyInit);
      var actividades = "Actividades";
      var datos_usuario = "datos_usuario";
      //console.log(newToken[datos_usuario]);
      user = newToken[datos_usuario];
      if(response.ok === true && response.status === 200)
      {
          //console.log(Object.values(newToken[actividades]));
          let keys = Object.keys(newToken[actividades]);
          var i = 0;
          Object.values(newToken[actividades]).forEach(element => {
            console.log(JSON.stringify(element));
            var item = {
              name: keys[i],
              sucursal: element.nombre_sucursal,
              prioridad: element.id_prioridad,
              estado: element.estado,
              id_plan_trabajo: element.id_plan_trabajo,
              calificacion_pv: element.calificacion_pv,
              observaciones: element.observaciones,
              id_kardex: element.id_kardex,
              id_ingreso_sucursal: element.id_ingreso_sucursal,
              id_apertura: element.id_apertura,
              id_formula: element.id_formula,
              id_condiciones: element.id_condiciones,
              nombre_tabla: element.nombre_tabla,
              estado: element.estado,
              separador: false
            };
            if(i === 0){sucursalActual = element.nombre_sucursal; items.push({sucursal: element.nombre_sucursal, separador: true});}
            if(sucursalActual !== element.nombre_sucursal){items.push({sucursal: element.nombre_sucursal, separador: true}); sucursalActual = element.nombre_sucursal}
            i = i + 1;                                            
            items.push(item);
          });
          console.log(items)
      }
      else
      {
          toastr.showToast(newToken[actividades],'warning');//No se encontraron planes de trabajo para hoy
      }
      //return response.json();
    }).catch(function(error){
      toastr.showToast('Su sesión expiró','danger');
      handler2 = true;
      console.log(error);
    });
    if(!handler2){
      this.setState({ loading: false, refreshing: false });
    }
    else{this.props.handler2(0,null,[]);}
  }

  /**
   * Cambiar al Layout activity al presionar el Item y enviarle los datos de ese item
   * @param {function} handler 
   * @param {Array} item 
   */
  _OnItemPress(handler, item)
  {
    handler(2,token,item);
  }

  render() {
    /***
     * Mostrar layout luego de cargar tipos de fuente
     */
    if (this.state.loading) {
      return (<View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color='blue' /></View>);
    }
    return (
      <Content refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={() => this.getPlanesDeTrabajo()}
          />
        }>
        <List>
          <ListItem avatar style={{marginBottom: 5}}>
            <Left>
              <Thumbnail source={{ uri: 'https://banner2.kisspng.com/20180410/bbw/kisspng-avatar-user-medicine-surgery-patient-avatar-5acc9f7a7cb983.0104600115233596105109.jpg' }} />
            </Left>
            <Body>
              <Text>{user.nombre} {user.apellido}</Text>
              <Text note>{user.cedula}</Text>
            </Body>
            <Right>
              <Text note>{user.codigo}</Text>
            </Right>
          </ListItem>
        </List>
        <List dataArray={items}
          renderRow={(item) =>
          item.separador === true ?
            <ListItem itemDivider>
              <Text>{item.sucursal}</Text>
            </ListItem>
          :
            <ListItem icon button onPress={() => this._OnItemPress(this.props.handler2, item)}>
              <Left>
              {
                (item.estado === "activo" || item.estado === "Activo") && <Icon active ios='ios-time' android='md-time' />
              }
              {
                item.estado === "terminado" && <Icon active ios='ios-checkmark' android='md-checkmark' />
              }
              {
                item.estado === "completo" && <Icon active ios='ios-checkmark' android='md-checkmark' />
              }
              </Left>
              <Body>
                <Text>{item.name}</Text>
              </Body>
              <Right>
                {
                  item.prioridad === 5 && <Badge><Text>urgente</Text></Badge>
                }
                {                  
                  item.prioridad === 2 && <Badge warning><Text>media</Text></Badge>
                }
                {                  
                  item.prioridad === 1 && <Badge info><Text>normal</Text></Badge>
                }
              </Right>
            </ListItem>
          }>
        </List>
      </Content>
    );
  }
}