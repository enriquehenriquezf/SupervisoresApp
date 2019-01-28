import * as Expo from 'expo';
import React, { Component } from 'react';
import { Left, Body, Right, Content, List,ListItem,Text, Badge, Icon, Spinner, Card } from 'native-base';
import {toastr} from '../../../components/Toast';
import {View, RefreshControl, AsyncStorage} from 'react-native';
import styles from '../../../styles/Home';
import {api} from '../../../services/api';
import { UserInfo } from '../../../components/UserInfo';
import { COLOR } from '../../../components/Colores';

let items = [];
let user = [];
let sucursalActual = null;
let tiempoInactivo=0;
let tiempoInactivoInit=0;
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      refreshing: false,
      showToast: false,
      estado:true
    };
    let token = this.props.token;
    let newToken = null;
    tiempoInactivo=0;
    tiempoInactivoInit=0;
    this._retrieveData();
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
    items = [];
    let handler2 = false;
    this.setState({refreshing: true });
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    await fetch(api.ipHomeCompletados, {
      method: 'GET',
      headers: {
          'Authorization': auth,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept':'application/json'
      },
      body: ''
    }).then(function(response){
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
          var j = 0;
          Object.values(newToken[actividades]).forEach(element => {
            //console.log(JSON.stringify(element));  
            var item = {
              name: keys[i].split('-')[0],
              sucursal: element.nombre_sucursal,
              cod_sucursal: element.cod_sucursal,
              prioridad: element.id_prioridad,
              estado: element.estado,
              id_plan_trabajo: element.id_plan_trabajo,
              calificacion_pv: element.calificacion_pv,
              observacion: element.observacion,
              id_actividad: element.id,
              nombre_tabla: element.nombre_tabla,
              documento_vencido: element.documento_vencido,
              documento_renovado: element.documento_renovado,
              productos: element.productos,
              laboratorios_asignados: element.laboratorios_asignados,
              laboratorios_realizados: element.laboratorios_realizados,
              numero_consecutivo: element.numero_consecutivo,
              tiempo_actividad: element.tiempo_actividad,
              motivo_ausencia: element.motivo_ausencia,
              tiempoInactivo: tiempoInactivo,
              tiempoInactivoInit: tiempoInactivoInit,
              latitud: 11.0041235,
              longitud: -74.8130534,
              separador: false
            };
            if(i === 0){sucursalActual = element.nombre_sucursal; items.push({sucursal: element.nombre_sucursal,direccion: element.direccion, separador: true, first:true});}
            if(sucursalActual !== element.nombre_sucursal){items.push({sucursal: element.nombre_sucursal,direccion: element.direccion, separador: true, first:false}); j = j + 1; sucursalActual = element.nombre_sucursal}                                    
            items.push(item);
            i = i + 1;       j = j + 1;   
          });
          //console.log(items)
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
          toastr.showToast(newToken[actividades],'warning');
        }
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
    else{this.props.handler2(-1,token,[]);}
  }

  /**
   * Cambiar al Layout activity al presionar el Item y enviarle los datos de ese item
   * @param {function} handler 
   * @param {Array} item 
   */
  _OnItemPress(index,handler, item)
  {
    if(this.state.estado !== 'false' || index === 5){
      handler(index,token,item);
    }
    else
    {
      toastr.showToast('Cambie su estado a Activo','warning');
    }
  }

  /**
   * Obtener Estado del supervisor
   */
  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.multiGet(['ESTADO','TIME_INACTIVO','TIME_INACTIVO_INIT']);
      if (value !== null) {
        this.setState({estado : value[0][1]});
        if(value[1][1] !== null){
          tiempoInactivoInit = value[2][1];
          tiempoInactivo = value[1][1] - tiempoInactivoInit;
        }
        //console.log(tiempoInactivo);
      }
    } catch (error) {
      console.log(error);
    }
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
            colors={[COLOR.verde]}
          />
        }>
        <UserInfo handler2={this.props.handler2} user={user} estado={this.state.estado}></UserInfo>
        <List dataArray={items}
          renderRow={(item) =>
          item.separador === true ?
            <View>
              {item.first === true ?
                  null
                :
                  <View style={styles.separadorSucursales}></View>
              }
              <ListItem button underlayColor={COLOR.azulTransparente} itemDivider style={styles.ConBorde} onPress={() => toastr.showToast(item.direccion,'info')} >
                <Text style={styles.sucursalText}>{item.sucursal}</Text>
              </ListItem>
            </View>
          :
            <ListItem button underlayColor={COLOR.azulTransparente} onPress={() => this._OnItemPress(2,this.props.handler2, item)} style={styles.SinBorde}>
              <Left >
                <View style={styles.ActividadBackground}>
                  <Text style={styles.ActividadText}>{item.name}</Text>
                </View>
              </Left>
              <Right>
              {
                item.prioridad === 3 && <View style={[styles.prioridad,{backgroundColor:COLOR.rojo}]}><Text style={styles.ActividadText}>urgente</Text></View>
              }
              {                  
                item.prioridad === 2 && <View style={[styles.prioridad,{backgroundColor:COLOR.amarillo}]}><Text style={styles.ActividadText}>media</Text></View>
              }
              {                  
                item.prioridad === 1 && <View style={[styles.prioridad,{backgroundColor:COLOR.verde}]}><Text style={styles.ActividadText}>normal</Text></View>
              }
              </Right>
            </ListItem>
          }>
        </List>
      </Content>
    );
  }
}