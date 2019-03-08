import * as Expo from 'expo';
import React, { Component } from 'react';
import { Left, Body, Right, Content, List,ListItem,Text, Badge, Icon, Spinner, Card } from 'native-base';
import {toastr} from '../../../components/Toast';
import {View, RefreshControl, AsyncStorage} from 'react-native';
import styles from '../../../styles/Home';
import {api} from '../../../services/api';
import { COLOR } from '../../../components/Colores';
import { logError } from '../../../components/logError';

let items = [];
let sucursalActual = null;
let tiempoInactivo=0;
let tiempoInactivoInit=0;
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
              titulo: element.titulo,
              sucursal: element.nombre_sucursal,
              cod_sucursal: element.cod_sucursal,
              id_sucursal: element.id_sucursal,
              prioridad: element.id_prioridad,
              estado: element.id_estado,
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
              ano_actual: element.ano_actual,
              ano_anterior: element.ano_anterior,
              base:element.base,
              gastos:element.gastos,
              diferencia:element.diferencia,
              sobrante:element.sobrante,
              faltante:element.faltante,
              horario: element.horario,
              mes_anterior: element.mes_anterior,
              venta_domicilios_proyeccion: element.venta_domicilios_proyeccion,
              numero_mensajeros_planta: element.numero_mensajeros_planta,
              pro_domicilio_mensajero: element.pro_domicilio_mensajero,
              mes_actual: element.mes_actual,
              dias_transcurridos: element.dias_transcurridos,
              consecutivos: element.consecutivos,
              numero_remisiones: element.numero_remisiones,       
              promociones_separata: element.promociones_separata,
              desc_escalonados: element.desc_escalonados,
              tienda_virtual: element.tienda_virtual,
              puntos_saludables: element.puntos_saludables,
              close_up: element.close_up,
              correspondencia:element.correspondencia,
              valor_pedido:element.valor_pedido,
              valor_despacho:element.valor_despacho,
              diferencia:element.diferencia,
              nivel_servicio:element.nivel_servicio,
              revisa_pedidos_antes_enviarlos:element.revisa_pedidos_antes_enviarlos,
              utiliza_libreta_faltantes:element.utiliza_libreta_faltantes,
              valor_actual:element.valor_actual,
              dias_inventario:element.dias_inventario,
              inv_optimo:element.inv_optimo,
              valor_dev_cierre_mes:element.valor_dev_cierre_mes,
              dev_vencimiento_m_estado:element.dev_vencimiento_m_estado, 
              productos_cero: element.productos_cero,
              productos_cero_rotante_90_dias: element.productos_cero_rotante_90_dias,    
              acciones_tomadas: element.acciones_tomadas,
              productos_no_rotan: element.productos_no_rotan,
              proximos_vencer: element.proximos_vencer,
              venta_mes_anterior: element.venta_mes_anterior,
              proyeccion_mes_actual: element.proyeccion_mes_actual,
              relacion_faltantes: element.relacion_faltantes, 
              consumo: element.consumo, 
              examen:element.examen,
              senalizacion:element.senalizacion,
              seguro:element.seguro,
              contrato:element.contrato,
              relacion_vendedores:element.relacion_vendedores,
              aplica_proceso_ideal_venta:element.aplica_proceso_ideal_venta,
              implementar_estrategia: element.implementar_estrategia,
              compromiso:element.compromiso,
              fecha_resolucion:element.fecha_resolucion,
              numero_facturas_autorizadas:element.numero_facturas_autorizadas,
              fecha_ultima_factura:element.fecha_ultima_factura,
              numero_ultima_factura:element.numero_ultima_factura,   
              descripcion_ptc:element.descripcion_ptc,
              data:element.data,       
              tiempo_actividad: element.tiempo_actividad,
              motivo_ausencia: element.motivo_ausencia,
              tiempoInactivo: tiempoInactivo,
              tiempoInactivoInit: tiempoInactivoInit,
              latitud: 11.0041235,
              longitud: -74.8130534,
              separador: false
            };
            if(item.titulo !== undefined){item.name = item.titulo;}
            if(i === 0){sucursalActual = element.nombre_sucursal; items.push({sucursal: element.nombre_sucursal,direccion: element.direccion, separador: true, first:true});}
            if(sucursalActual !== element.nombre_sucursal){items.push({sucursal: element.nombre_sucursal,direccion: element.direccion, separador: true, first:false}); j = j + 1; sucursalActual = element.nombre_sucursal}                                    
            items.push(item);
            i = i + 1;       j = j + 1;   
          });
          //items.sort(function(a,b){return a.name > b.name});
          //console.log(items)
      }
      else
      {
        console.log(response);
        if(response.status === 500){
          var newToken = JSON.parse(response._bodyInit);
          var header = JSON.stringify({ok:response.ok, status:response.status, statusText:response.statusText, type:response.type, url:response.url});
          var body = JSON.stringify({message:newToken.message,exception:newToken.exception,file:newToken.file,line:newToken.line});
          logError.sendError(header,body,auth);
          toastr.showToast('Error con el servidor','danger');
        }
        else if(response.status === 401){
          toastr.showToast('Su sesión expiró','danger');
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
    if(this.props.estado !== 'false' || index === 5){
      handler(index,token,item);
    }
    else
    {
      toastr.showToast('Cambie su estado a Activo','warning');
    }
  }

  /**
   * Obtener el tiempo inactivo
   */
  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.multiGet(['TIME_INACTIVO','TIME_INACTIVO_INIT']);
      if (value !== null) {
        if(value[0][1] !== null){
          tiempoInactivoInit = value[1][1];
          tiempoInactivo = value[0][1] - tiempoInactivoInit;
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