/**
 * @author Enrique Henriquez Figueroa
 * @copyright Binar10
 */
import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, Text, Icon, Button, Spinner, Textarea, Form,List, ListItem, H2, Card, Input,CheckBox, Picker, DatePicker, Drawer } from 'native-base';
import {toastr} from '../components/Toast';
import {View,Platform, BackHandler, KeyboardAvoidingView, AsyncStorage, Image,TouchableOpacity,FlatList, ScrollView, Keyboard, Alert} from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';
import NumericInput from 'react-native-numeric-input';
import Overlay from 'react-native-modal-overlay';
import styles from '../styles/Activity';
import IconStyles from '../styles/Icons';
import {api} from '../services/api';
import {Imagen} from '../components/Imagenes';
import { RadioButton } from '../components/RadioButton';
import SideBar from './SideBar';
import { COLOR } from '../components/Colores';
import { logError } from '../components/logError';
import Camara from '../components/Camara';

var BUTTONS = ["SINIESTRO","VISITAS DE ENTIDADES PÚBLICAS","REQUERIMIENTO GERENCIAL", "AUSENCIA ADMINISTRADOR", "TRABAJO ESPECIAL"];
let items = null;
let info = '';
let time = 0;
let timeInit = 0;
let totalTime = 0;
let totalTimeInit = 0;
let imgOverlay = '';
let imgTemp1 = '';
let imgTemp2 = '';
let TIEMPOAUSENCIA = 1800000;// más de media hora ausente     ( > 1800000 ) 
let items2 = [];
let Lista = null;
let closingKeyboard;
let vendedores = [];
export default class Activity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      archivo: {},
      archivo2: {},
      loading: true,
      loading2: false,
      checked: 5 ,
      checked2: 5 ,
      calificacion_pv: 'Completo',
      observacion: '',
      observacion2: '',
      latitude: null,
      longitude: null,
      error:null,
      isVisible: false,
      isVisible2: false,
      isVisibleCam: false,
      isVisibleActividad: false,
      isVisibleActividad2: false,
      isVisibleActividad3: false,
      isLoadActividad: false,
      ausencia: false,
      motivo: '',
      selected:'0',
      imgVencido:'',
      imgRenovado:'',
      numero_consecutivo:'',
      productos:[],
      productos2:[],
      PRODUCTS:[],
      PRODUCTS2:[],
      laboratorios:[],
      LABORATORIES:[],
      chosenDate: new Date(),
      query2:[],
      lista:null,
      documentos:{},
      disable:false,
      porcentajes:{},
      ano_actual:'0',
      ano_anterior:'0',
      estrategia:'',
      base:'0',
      gastos:'0',
      diferencia:'0',
      sobrante:'0',
      faltante:'0',
      horario:{dias_habiles:{apertura:'',cierre:''},domingos_feriados:{apertura:'',cierre:'',primer_turno:'',segundo_turno:'',tercer_turno:''}},
      domicilios:{mes_anterior:'0',mes_actual:'0',dia_actual:'1',venta_proyeccion:'0',num_mensajeros:'0',prom_domicilio_mensajero:'0'},
      remisiones:{numero_remisiones:'',consecutivos:''},
      mercadeo:{promociones_separata:5,desc_escalonados:5,tienda_virtual:5,puntos_saludables:5,close_up:5},
      bodega:{valor_pedido:'',valor_despacho:'',diferencia:'',nivel_servicio:'',revisa_pedidos_antes_enviarlos:'',utiliza_libreta_faltantes:''},
      mercancia:{valor_actual:'',dias_inventario:'',inv_optimo:'',valor_dev_cierre_mes:'',dev_vencimiento_m_estado:''},
      julienne:{mes_anterior:'0',mes_actual:'0',dia_actual:'1',venta_proyeccion:'0'},
      servicios_publicos:{agua:{mes_actual:'',mes_pasado:''},luz:{mes_actual:'',mes_pasado:''},telefono:{mes_actual:'',mes_pasado:''},internet:{mes_actual:'',mes_pasado:''}},
      examen:[],
      senalizacion:[],
      relacion_vendedores:[],
      aplica_proceso_ideal_venta:1,
      correspondencia:'',
      compromiso:'',
      acciones_tomadas:'',
      facturas_autorizadas:'',
      fecha_resolucion: new Date(),
      numero_ultima_factura:'',
      fecha_ultima_factura: new Date(),
      ptc:[],
      updated:false,
      takePicture:{vencido:true,index:-1},
      showToast: false
    };
    let token = this.props.token;
    items = this.props.data;
    if(items.nombre_tabla === 'examen_gimed' || items.nombre_tabla === 'relacion_vendedores'){this.getEmpleados();}
    time = 0;
    totalTime = 0;
    totalTimeInit = new Date().getTime();
    timeInit = new Date().getTime();
    imgOverlay = '';
    items2 = [];
    this._imgs = [];
    this.SetChecked = this.SetChecked.bind(this);
    this.ModificarProducto = this.ModificarProducto.bind(this);
    this.setDate = this.setDate.bind(this);
    this.closeDrawer = this.closeDrawer.bind(this);
    this.setImage = this.setImage.bind(this);
    console.ignoredYellowBox = ['Require cycle:'];
  }

  async componentWillMount() {
    /**
     * Verificar que el dispositivo no sea un emulador
     */
    if (Platform.OS === 'android' && !Expo.Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }
    navigator.geolocation.clearWatch(this.watchId);
    this.Descripcion();
    if(items.nombre_tabla === 'documentacion_legal'){this.ListarDocumentacion();}
    else if(items.nombre_tabla === 'condiciones_locativas'){this.ListarCondiciones();}
    else if(items.nombre_tabla === 'senalizacion'){this.ListarSenalizacion();}
    if((items.seguro === null || items.seguro === undefined) && (items.contrato === null || items.contrato === undefined)){
      imgTemp1 = Imagen.noDisponible;
    }
    else{
      items.seguro ? imgTemp1 = api.ipImg + items.seguro : imgTemp1 = api.ipImg + items.contrato;
    }
    //this._retrieveDataInit();
    this._retrieveData();
    this.setState({loading: false, imgVencido:imgTemp1});
    //this._retrieveDataAusente();
  }

  /**
   * Obtener la descripción del plan de trabajo a realizar
   */
  Descripcion = async() => {
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    await fetch(api.ipDescripcion + '?nombre_tabla=' + items.nombre_tabla, {
      method: 'GET',
      headers: {
          'Authorization': auth,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept':'application/json'
      },      
      body: ''
    }).then(function(response) {
      //console.log(response);
      if(response.ok === true)
      {
        var token2 = JSON.parse(response._bodyInit)
        //console.log(token2["message"]);
        info = token2["message"].descripcion;
      }
      else{
        var newToken = JSON.parse(response._bodyInit);
        var header = JSON.stringify({ok:response.ok, status:response.status, statusText:response.statusText, type:response.type, url:response.url});
        var body = JSON.stringify({message:newToken.message,exception:newToken.exception,file:newToken.file,line:newToken.line});
        logError.sendError(header,body,auth);
      }
    }).catch(function(error){
      //toastr.showToast('Su sesión expiró','danger');
      console.log(error);
    });
  }

  /**
   * Obtener la lista de señalización
   */
  ListarSenalizacion = async() => {
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    var that = this;
    await fetch(api.ipSenalizacion, {
      method: 'GET',
      headers: {
          'Authorization': auth,
          'Content-Type': 'application/json',
          'Accept':'application/json'
      },      
      body: ''
    }).then(function(response) {
      //console.log(response);
      var senal = items.senalizacion? JSON.parse(items.senalizacion) : [];
      if(response.ok === true)
      {
        var token2 = JSON.parse(response._bodyInit)
        var senalizacion = token2;
        //console.log(senalizacion)
        if(items.nombre_tabla === 'senalizacion'){
          /**
           * items de la lista de vendedores para el examen gimed
           */
          Lista = senalizacion.map((data,index) => {
            !items.senalizacion? senal.push({id:data.id,senalizacion:data.senalizacion,respuesta:0,observaciones:''}) : null
            return(
              <Picker.Item key={Math.floor(Math.random() * 1000) + 1} label={data.senalizacion} value={index}/>
            )
          })
          //console.log(senal)
          that.setState({lista:Lista, senalizacion: senal});
        }
      }
      else{        
        var newToken = JSON.parse(response._bodyInit);
        var header = JSON.stringify({ok:response.ok, status:response.status, statusText:response.statusText, type:response.type, url:response.url});
        var body = JSON.stringify({message:newToken.message,exception:newToken.exception,file:newToken.file,line:newToken.line});
        logError.sendError(header,body,auth);
      }
    }).catch(function(error){
      //toastr.showToast('Su sesión expiró','danger');
      console.log(error);
    });
  }


  /**
   * Obtener los empleados de la sucursal
   */
  getEmpleados = async() => {
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    var that = this;
    await fetch(api.ipEmpleadosSucursal, {
      method: 'POST',
      headers: {
          'Authorization': auth,
          'Content-Type': 'application/json',
          'Accept':'application/json'
      },      
      body: JSON.stringify({id_sucursal:items.id_sucursal,nombre:''})
    }).then(function(response) {
      console.log(response);
      if(response.ok === true)
      {
        var token2 = JSON.parse(response._bodyInit)
        vendedores = token2.data;
        // that.setState({vendedores: token2.data});
        var examen = items.examen ? JSON.parse(items.examen) : [];
        var relacion_vendedores = items.relacion_vendedores ? JSON.parse(items.relacion_vendedores) : [];
        var aplica_proceso_ideal_venta = items.aplica_proceso_ideal_venta ? items.aplica_proceso_ideal_venta : 1;
        
        console.log(vendedores)
        // console.log(this.state.vendedores)
        if(!items.examen && items.nombre_tabla === 'examen_gimed'){for(let i = 0; i < vendedores.length; i++){examen.push({id_vendedor:vendedores[i].dk_empleado,vendedor:vendedores[i].nombre + ' ' + vendedores[i].apellido,cargo:vendedores[i].cargo, productos_consultados:[],resultados:''});}}
        if(items.nombre_tabla === 'examen_gimed'){
          /**
           * items de la lista de vendedores para el examen gimed
           */
          Lista = examen.map((data,index) => {
            return(
              <Picker.Item key={Math.floor(Math.random() * 1000) + 1} label={data.vendedor} value={index}/>
            )
          })
          that.setState({lista:Lista,examen:examen,relacion_vendedores:relacion_vendedores,aplica_proceso_ideal_venta:aplica_proceso_ideal_venta});
        }
        if(!items.relacion_vendedores && items.nombre_tabla === 'relacion_vendedores'){for (let i = 0; i < vendedores.length; i++){ relacion_vendedores.push({id_vendedor:vendedores[i].dk_empleado,vendedor:vendedores[i].nombre + ' ' + vendedores[i].apellido,cargo:vendedores[i].cargo, proyeccion_venta_general:'',gimed_vs_venta_general:'',ordinario_vs_venta_general:'',conoce_indicados:1,agenda_los_clientes:false,cuantos_clientes_activos:'',presentacion_personal:1,porta_carnet:1,conoce_objetivos:1,no_cumple_cuotas:false,diagnostico:'',toma_de_deciciones:''}); }}
        if(items.nombre_tabla === 'relacion_vendedores'){
          /**
           * items de la lista de vendedores para la relacion vendedores
           */
          Lista = relacion_vendedores.map((data,index) => {
            return(
              <Picker.Item key={Math.floor(Math.random() * 1000) + 1} label={data.vendedor} value={index}/>
            )
          })
          that.setState({lista:Lista,examen:examen,relacion_vendedores:relacion_vendedores,aplica_proceso_ideal_venta:aplica_proceso_ideal_venta});
        }
        
        //console.log(vendedores);
        //console.log(token2.data);
      }
      else{        
        var newToken = JSON.parse(response._bodyInit);
        var header = JSON.stringify({ok:response.ok, status:response.status, statusText:response.statusText, type:response.type, url:response.url});
        var body = JSON.stringify({message:newToken.message,exception:newToken.exception,file:newToken.file,line:newToken.line});
        logError.sendError(header,body,auth);
      }
    }).catch(function(error){
      //toastr.showToast('Su sesión expiró','danger');
      console.log(error);
    });
  }

  /**
   * Obtener la lista de documentación legal a realizar
   */
  ListarDocumentacion = async() => {
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    var that = this;
    await fetch(api.ipListarDocumentacion, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
        'Accept':'application/json'
      },      
      body: JSON.stringify({
        id_actividad: items.id_actividad
      })
    }).then(function(response) {
      //console.log(response);
      if(response.ok === true)
      {
        var token2 = JSON.parse(response._bodyInit);
        //console.log(token2["message"]);
        //info = token2["message"].descripcion;
        Object.values(token2).forEach(element => {
          var item = {
            id: element.id,
            id_documento: element.id_documento,
            documento: element.documento,
            estado_documento: element.estado_documento
          }
          items2.push(item);
        });
        /**
         * items de la lista de documentos
         */
        Lista = items2.map((data,index) => {
          return(
            (data.estado_documento === 'Si' || data.estado_documento === 'No') ?
              <Picker.Item key={Math.floor(Math.random() * 1000) + 1} label={data.documento} value={index} color={'#5cb85c'} />
            :
              <Picker.Item key={Math.floor(Math.random() * 1000) + 1} label={data.documento} value={index} color={'#000000'} />
          )
        })
        that.setState({lista:Lista});
      }
      else{        
        console.log(response);
        var newToken = JSON.parse(response._bodyInit);
        var header = JSON.stringify({ok:response.ok, status:response.status, statusText:response.statusText, type:response.type, url:response.url});
        var body = JSON.stringify({message:newToken.message,exception:newToken.exception,file:newToken.file,line:newToken.line});
        logError.sendError(header,body,auth);
      }
    }).catch(function(error){
      //toastr.showToast('Su sesión expiró','danger');
      console.log(error);
    });
  }

  
  /**
   * Obtener datos del documento a realizar
   */
  AccederDocumento = async() => {
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    var that = this;
    this.setState({isVisibleActividad:true})
    var noDisponible = Imagen.noDisponible;
    await fetch(api.ipAccederDocumento, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
        'Accept':'application/json'
      },      
      body: JSON.stringify({
        id:items2[this.state.selected].id,
        id_actividad: items.id_actividad,
        id_documento:items2[this.state.selected].id_documento
      })
    }).then(function(response) {
      //console.log(response);
      if(response.ok === true)
      {
        var token2 = JSON.parse(response._bodyInit);
        //console.log(token2["message"]);
        //info = token2["message"].descripcion;
        var item = {
          id: token2.id,
          id_documento: token2.id_documento,
          documento: token2.documento,
          estado_documento: token2.estado_documento,
          documento_vencido: token2.documento_vencido,
          documento_renovado: token2.documento_renovado,
          observaciones: token2.observaciones
        }
        /**
         * Cambiar image Source por imagen no disponible si no se encuentra la url en la db
         */
        if(item.documento_vencido === '' || item.documento_vencido === null){
          imgTemp1 = noDisponible;
        }
        else{
          imgTemp1 = api.ipImg + item.documento_vencido;
        }
        if(item.documento_renovado === '' || item.documento_renovado === null){
          imgTemp2 = noDisponible;
        }
        else{
          imgTemp2 = api.ipImg + item.documento_renovado;
        }
        that.setState({documentos: item, isLoadActividad:true, imgVencido: imgTemp1, imgRenovado: imgTemp2,observacion2:item.observaciones, archivo:{}, archivo2:{}});
        if(item.estado_documento === 'Si' || item.estado_documento === '' || item.estado_documento === null)
        {
          that.SetChecked(5,'Si');
        }
        else if(item.estado_documento === 'No')
        {
          that.SetChecked(1,'No');
        }
      }
      else{        
        console.log(response);
        var newToken = JSON.parse(response._bodyInit);
        var header = JSON.stringify({ok:response.ok, status:response.status, statusText:response.statusText, type:response.type, url:response.url});
        var body = JSON.stringify({message:newToken.message,exception:newToken.exception,file:newToken.file,line:newToken.line});
        logError.sendError(header,body,auth);
      }
    }).catch(function(error){
      //toastr.showToast('Su sesión expiró','danger');
      console.log(error);
    });
  }
  
  /**
   * Actualizar datos del documento
   */
  UpdateData = async() => {
    this.setState({loading2:true});
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    /** Imagenes de documentacion legal */
    let file1 = '';
    let file2 = '';
    let that = this;
    if(this.state.archivo.hasOwnProperty('uri')){
      await Expo.FileSystem.readAsStringAsync(this.state.archivo.uri, {encoding: Expo.FileSystem.EncodingTypes.Base64}).then(function(response){
        file1 = response;
      });
    }
    else{
      if(this.state.documentos.documento_vencido !== '' && this.state.documentos.documento_vencido !== null){
        file1 = this.state.imgVencido;
      }
    }
    if(this.state.archivo2.hasOwnProperty('uri')){
      await Expo.FileSystem.readAsStringAsync(this.state.archivo2.uri, {encoding: Expo.FileSystem.EncodingTypes.Base64}).then(function(response){
        file2 = response;
      });
    }
    else{
      if(this.state.documentos.documento_renovado !== '' && this.state.documentos.documento_renovado !== null){
        file2 = this.state.imgRenovado;
      }
    }
    await fetch(api.ipTerminarDocumento, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
        'Accept':'application/json'
      },      
      body: JSON.stringify({
        id_actividad: items.id_actividad,
        id_documento: this.state.documentos.id_documento,
        estado_documento: this.state.documentos.estado_documento,
        documento_vencido: file1,
        documento_renovado: file2,
        observaciones: this.state.observacion2,
        nombre_sucursal:items.cod_sucursal,
        nombre_documento:this.state.documentos.documento
      })
    }).then(function(response) {
      //console.log(response);
      if(response.ok === true)
      {
        var token2 = JSON.parse(response._bodyInit);
        that.setState({loading2:false,isVisibleActividad:false,isLoadActividad:false,disable:false});
        toastr.showToast(token2["message"],'success');
      }
      else{        
        console.log(response);
        that.setState({loading2:false,isVisibleActividad:false,isLoadActividad:false,disable:false});
        var newToken = JSON.parse(response._bodyInit);
        var header = JSON.stringify({ok:response.ok, status:response.status, statusText:response.statusText, type:response.type, url:response.url});
        var body = JSON.stringify({message:newToken.message,exception:newToken.exception,file:newToken.file,line:newToken.line});
        logError.sendError(header,body,auth);
      }
    }).catch(function(error){
      //toastr.showToast('Su sesión expiró','danger');
      that.setState({loading2:false,isVisibleActividad:false,isLoadActividad:false,disable:false});
      console.log(error);
    });
  }
  
  /**
   * Obtener la lista de Condiciones Locativas a realizar
   */
  ListarCondiciones = async() => {
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    var that = this;
    await fetch(api.ipListarCondiciones, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
        'Accept':'application/json'
      },      
      body: JSON.stringify({
        id_actividad: items.id_actividad
      })
    }).then(function(response) {
      //console.log(response);
      if(response.ok === true)
      {
        var token2 = JSON.parse(response._bodyInit);
        Object.values(token2).forEach(element => {
          var item = {
            id: element.id,
            id_condicion: element.id_condicion,
            condicion: element.condicion_locativa,
            estado_condicion: element.estado_condicion
          }
          items2.push(item);
        });
        /**
         * items de la lista de condiciones
         */
        Lista = items2.map((data,index) => {
          return(
            (data.estado_condicion === 'Bueno' || data.estado_condicion === 'Malo') ?
              <Picker.Item key={Math.floor(Math.random() * 1000) + 1} label={data.condicion} value={index} color={'#5cb85c'} />
            :
              <Picker.Item key={Math.floor(Math.random() * 1000) + 1} label={data.condicion} value={index} color={'#000000'} />
          )
        })
        that.setState({lista:Lista});
      }
      else{        
        console.log(response);
        var newToken = JSON.parse(response._bodyInit);
        var header = JSON.stringify({ok:response.ok, status:response.status, statusText:response.statusText, type:response.type, url:response.url});
        var body = JSON.stringify({message:newToken.message,exception:newToken.exception,file:newToken.file,line:newToken.line});
        logError.sendError(header,body,auth);
      }
    }).catch(function(error){
      //toastr.showToast('Su sesión expiró','danger');
      console.log(error);
    });
  }

  /**
   * Obtener datos de la condicion a realizar
   */
  AccederCondicion = async() => {
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    var that = this;
    this.setState({isVisibleActividad2:true});
    var noDisponible = Imagen.noDisponible;
    await fetch(api.ipAccederCondicion, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
        'Accept':'application/json'
      },      
      body: JSON.stringify({
        id:items2[this.state.selected].id,
        id_actividad: items.id_actividad,
        id_condicion:items2[this.state.selected].id_condicion
      })
    }).then(function(response) {
      //console.log(response);
      if(response.ok === true)
      {
        var token2 = JSON.parse(response._bodyInit);
        //console.log(token2["message"]);
        //info = token2["message"].descripcion;
        var item = {
          id: token2.id,
          id_condicion: token2.id_condicion,
          condicion: token2.condicion_locativa,
          estado_condicion: token2.estado_condicion,
          foto_condicion: token2.foto_condicion,
          observaciones: token2.observaciones
        }
        /**
         * Cambiar image Source por imagen no disponible si no se encuentra la url en la db
         */
        if(item.foto_condicion === '' || item.foto_condicion === null){
          imgTemp1 = noDisponible;
        }
        else{
          imgTemp1 = api.ipImg + item.foto_condicion;
        }
        that.setState({documentos: item, isLoadActividad:true, imgVencido: imgTemp1, observacion2:item.observaciones, archivo:{}});
        if(item.estado_condicion === 'Bueno' || item.estado_condicion === '' || item.estado_condicion === null)
        {
          that.SetChecked(5,'Bueno');
        }
        else if(item.estado_condicion === 'Malo')
        {
          that.SetChecked(1,'Malo');
        }
      }
      else{        
        console.log(response);
        var newToken = JSON.parse(response._bodyInit);
        var header = JSON.stringify({ok:response.ok, status:response.status, statusText:response.statusText, type:response.type, url:response.url});
        var body = JSON.stringify({message:newToken.message,exception:newToken.exception,file:newToken.file,line:newToken.line});
        logError.sendError(header,body,auth);
      }
    }).catch(function(error){
      //toastr.showToast('Su sesión expiró','danger');
      console.log(error);
    });
  }

  /**
   * Actualizar datos de la condicion locativa
   */
  UpdateDataCondicion = async() => {
    this.setState({loading2:true});
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    /** Imagenes de condiciones locativas */
    let file1 = '';
    let that = this;
    if(this.state.archivo.hasOwnProperty('uri')){
      await Expo.FileSystem.readAsStringAsync(this.state.archivo.uri, {encoding: Expo.FileSystem.EncodingTypes.Base64}).then(function(response){
        file1 = response;
      });
    }
    else{
      if(this.state.documentos.foto_condicion !== '' && this.state.documentos.foto_condicion !== null){
        file1 = this.state.imgVencido;
      }
    }
    await fetch(api.ipTerminarCondicion, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
        'Accept':'application/json'
      },      
      body: JSON.stringify({
        id_actividad: items.id_actividad,
        id_condicion: this.state.documentos.id_condicion,
        estado_condicion: this.state.documentos.estado_condicion,
        foto_condicion: file1,
        observaciones: this.state.observacion2,
        nombre_sucursal:items.cod_sucursal,
        nombre_condicion:this.state.documentos.condicion
      })
    }).then(function(response) {
      //console.log(response);
      if(response.ok === true)
      {
        //var conds = that.state.lista;
        //conds[that.state.selected].props.color = '#5cb85c'
        var token2 = JSON.parse(response._bodyInit);
        that.setState({loading2:false,isVisibleActividad2:false,isLoadActividad:false,disable:false});
        toastr.showToast(token2["message"],'success');
      }
      else{        
        console.log(response);
        that.setState({loading2:false,isVisibleActividad2:false,isLoadActividad:false,disable:false});
        var newToken = JSON.parse(response._bodyInit);
        var header = JSON.stringify({ok:response.ok, status:response.status, statusText:response.statusText, type:response.type, url:response.url});
        var body = JSON.stringify({message:newToken.message,exception:newToken.exception,file:newToken.file,line:newToken.line});
        logError.sendError(header,body,auth);
      }
    }).catch(function(error){
      //toastr.showToast('Su sesión expiró','danger');
      that.setState({loading2:false,isVisibleActividad2:false,isLoadActividad:false,disable:false});
      console.log(error);
    });
  }

  /**
   * Modificar los datos de examen gimed
   */
  UpdateDataExamenGimed(){
    var examen = this.state.examen;
    examen[this.state.selected].resultados = this.state.checked2;
    examen[this.state.selected].productos_consultados = this.state.PRODUCTS;
    this.setState({PRODUCTS: [], isVisibleActividad3:false,disable:false});
  }

  /**
   * Verificar que los permisos de GPS sean concedidos.
   */
  _getLocationAsync = async() => {    
    let { status } = await Expo.Permissions.askAsync(Expo.Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permiso para acceder al gps denegado',
      });
      console.log('Permiso para acceder al gps denegado');
      toastr.showToast('Debe conceder los permisos de GPS!','danger');
      this.handleBackPress();
    }
    else{
      //navigator.geolocation.clearWatch(this.watchId);
      console.log('Permiso Concedido');
    }
}

  async componentDidMount()
  {
    console.log(items);
    /** Agregar el metodo handleBackPress al evento de presionar el boton "Back" de android */
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);

    /**
     * Seleccionar el radioButton que se obtuvo de la base de datos
     */
    if(items.calificacion_pv === 'nocalificado' || items.calificacion_pv === null){
      this.SetChecked(5,items.calificacion_pv);
    }
    else{
      this.SetChecked(items.calificacion_pv,items.calificacion_pv);
    }

    var array = [];
    var array2 = [];
    var array3 = [];
    if(items.productos !== null && items.productos !== undefined && items.productos !== ""){
      //console.log(JSON.parse(items.productos));
      JSON.parse(items.productos).forEach(element =>{
        array.push(element);
      });
    }
    if((items.laboratorios_asignados !== undefined && items.laboratorios_asignados !== null && items.laboratorios_asignados !== "") && (items.laboratorios_realizados === undefined || items.laboratorios_realizados === null || items.laboratorios_realizados === "")){
      //console.log(JSON.parse(items.laboratorios_asignados));
      JSON.parse(items.laboratorios_asignados).forEach((element,index) =>{
        array2.push({dk:element.dk, nombre: element.nombre, prods: element.prods});
        array3.push({index:index});
      });
    }
    else if(items.laboratorios_realizados !== undefined && items.laboratorios_realizados !== null && items.laboratorios_realizados !== ""){
      //console.log(JSON.parse(items.laboratorios_asignados));
      JSON.parse(items.laboratorios_realizados).forEach((element,index) =>{
        array2.push({dk:element.dk, nombre: element.nombre, prods: element.prods, nuevo: element.nuevo});
        array3.push({index:index});
      });
    }
    else if(items.laboratorios !== undefined && items.laboratorios !== null && items.laboratorios !== ""){
      //console.log(JSON.parse(items.laboratorios_asignados));
      JSON.parse(items.laboratorios).forEach((element,index) =>{
        array2.push({dk:element.dk, nombre: element.nombre, prods: element.prods, nuevo: element.nuevo, estantes:element.estantes,entrepa:element.entrepa});
        array3.push({index:index});
      });
    }

    var horario = items.nombre_tabla === 'apertura' ? ((items.horario !== '' && items.horario !== null) ? JSON.parse(items.horario) : {dias_habiles:{apertura:'',cierre:''},domingos_feriados:{apertura:'',cierre:'',primer_turno:'',segundo_turno:'',tercer_turno:''}}) : ''
    var domicilios = this.state.domicilios;
    items.nombre_tabla === 'domicilios' ? (domicilios.mes_anterior =items.mes_anterior?items.mes_anterior:'0', domicilios.venta_proyeccion = items.venta_domicilios_proyeccion?items.venta_domicilios_proyeccion:'0', domicilios.num_mensajeros = items.numero_mensajeros_planta?items.numero_mensajeros_planta:'0', domicilios.prom_domicilio_mensajero = items.pro_domicilio_mensajero?items.pro_domicilio_mensajero:'0', domicilios.mes_actual = items.mes_actual?items.mes_actual:'0', domicilios.dia_actual = items.dias_transcurridos?items.dias_transcurridos:'0') : null
    var remisiones = this.state.remisiones;
    items.nombre_tabla === 'remisiones' ? (remisiones.consecutivos = items.consecutivos? items.consecutivos:'0', remisiones.numero_remisiones = items.numero_remisiones?items.numero_remisiones:'0') : null
    var mercadeo = this.state.mercadeo;
    items.nombre_tabla === 'programa_mercadeo' ? (mercadeo.promociones_separata = items.promociones_separata?items.promociones_separata:5,mercadeo.desc_escalonados = items.desc_escalonados?items.desc_escalonados:5,mercadeo.tienda_virtual = items.tienda_virtual?items.tienda_virtual:5,mercadeo.puntos_saludables = items.puntos_saludables?items.puntos_saludables:5,mercadeo.close_up = items.close_up?items.close_up:5) : null
    var bodega = this.state.bodega;
    items.nombre_tabla === 'servicio_bodega' ? (bodega.valor_pedido = items.valor_pedido?items.valor_pedido:'', bodega.valor_despacho = items.valor_despacho?items.valor_despacho:'', bodega.diferencia = items.diferencia?items.diferencia:'', bodega.nivel_servicio = items.nivel_servicio?items.nivel_servicio:'', bodega.revisa_pedidos_antes_enviarlos = items.revisa_pedidos_antes_enviarlos?items.revisa_pedidos_antes_enviarlos:'', bodega.utiliza_libreta_faltantes = items.utiliza_libreta_faltantes?items.utiliza_libreta_faltantes:'') : null
    var mercancia = this.state.mercancia;
    items.nombre_tabla === 'inventario_mercancia' ? (mercancia.valor_actual = items.valor_actual?items.valor_actual:'',mercancia.dias_inventario = items.dias_inventario?items.dias_inventario:'',mercancia.inv_optimo = items.inv_optimo?items.inv_optimo:'',mercancia.valor_dev_cierre_mes = items.valor_dev_cierre_mes?items.valor_dev_cierre_mes:'',mercancia.dev_vencimiento_m_estado = items.dev_vencimiento_m_estado?items.dev_vencimiento_m_estado:'') : null
    items.productos_cero ? array = JSON.parse(items.productos_cero) : items.productos_cero = []
    items.productos_cero_rotante_90_dias ? array2 = JSON.parse(items.productos_cero_rotante_90_dias) : items.productos_cero_rotante_90_dias = []
    items.productos_no_rotan ? array = JSON.parse(items.productos_no_rotan) : items.productos_no_rotan = []
    items.proximos_vencer ? array2 = JSON.parse(items.proximos_vencer) : items.proximos_vencer = []
    var julienne = this.state.julienne;
    items.nombre_tabla === 'julienne' ? (julienne.mes_anterior =items.venta_mes_anterior?items.venta_mes_anterior:'0', julienne.venta_proyeccion = items.proyeccion_mes_actual?items.proyeccion_mes_actual:'0', julienne.mes_actual = items.mes_actual?items.mes_actual:'0', julienne.dia_actual = items.dias_transcurridos?items.dias_transcurridos:'1') : null
    items.relacion_faltantes ? array = JSON.parse(items.relacion_faltantes) : items.relacion_faltantes = []
    var servicios_publicos = items.nombre_tabla === 'relacion_servicios_publicos' ? ((items.consumo !== '' && items.consumo !== null) ? JSON.parse(items.consumo) : {agua:{mes_actual:'',mes_pasado:''},luz:{mes_actual:'',mes_pasado:''},telefono:{mes_actual:'',mes_pasado:''},internet:{mes_actual:'',mes_pasado:''}}) : ''
    

    //Actualizar State #FF0000
    this.setState({observacion: items.observacion, numero_consecutivo: items.numero_consecutivo, ano_actual: items.ano_actual, ano_anterior: items.ano_anterior,base:items.base,gastos:items.gastos,diferencia:items.diferencia,sobrante:items.sobrante,faltante:items.faltante,horario:horario, domicilios:domicilios,remisiones:remisiones,mercadeo:mercadeo,correspondencia:items.correspondencia, bodega:bodega,mercancia:mercancia,servicios_publicos:servicios_publicos,acciones_tomadas:items.acciones_tomadas, estrategia: items.implementar_estrategia,compromiso:items.compromiso?items.compromiso:'',fecha_resolucion: items.fecha_resolucion,facturas_autorizadas: items.numero_facturas_autorizadas,fecha_ultima_factura: items.fecha_ultima_factura,numero_ultima_factura: items.numero_ultima_factura, PRODUCTS: array,LABORATORIES: array2, productos2: array3, PRODUCTS2: array2, ptc: items.nombre_tabla === 'actividades_ptc' ? JSON.parse(items.data) : []});
    
    /**
     * Obtener la geoposicion del dispositivo y verificar que se encuentre dentro del rango de la sucursal.
     * @example rango: a una distancia de 5000*10^-7 grados de latitud y longitud
     */
    var lat = 0;
    var long = 0;
    var RANGO = 0.0005000;
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        //console.log("Pos:");
        // console.log(position);
        lat = position.coords.latitude;
        long = position.coords.longitude;
        if(position.mocked === false)// verificar que no tenga un fake gps
        {
          if((lat >= parseFloat(items.latitud)-RANGO && lat <= parseFloat(items.latitud)+RANGO) && (long >= parseFloat(items.longitud)-RANGO && long <= parseFloat(items.longitud)+RANGO))
          {
            toastr.showToast('Se encuentra dentro de ' + items.sucursal,'info');
          }
          else
          {
            toastr.showToast('Está fuera del rango de ' + items.sucursal,'danger');
            this.handleBackPress();
          }  
          if(position.coords.accuracy < 2){
            toastr.showToast('Precisión del GPS muy baja','warning');
          }
        }
        else if(position.mocked === true){
          toastr.showToast('No puede alterar el GPS, su coordinador será notificado','danger');
          let bodyInit = JSON.parse(token._bodyInit);
          const auth = bodyInit.token_type + " " + bodyInit.access_token;
          var header = JSON.stringify({fakeGPS:true,sucursal:items.sucursal});
          var body = JSON.stringify(position);
          logError.sendError(header,body,auth);
          this.handleBackPress();
        }
      },
      (error) => {
        console.log(error);
        if(error.code === 'E_LOCATION_SERVICES_DISABLED'){
          toastr.showToast('Por favor active el GPS!','danger');
          this.handleBackPress();
        }
        //this.setState({ error: error.message })
      },
      { enableHighAccuracy: true, timeout: 60000, maximumAge: 1000 },
    );
  }

  componentWillUnmount() {
    /** Eliminar la funcion para el evento de Back Press */
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  /**
   * Retornar al Home
   */
  handleBackPress = () => {
    navigator.geolocation.clearWatch(this.watchId);
    this._storeData();
    this.props.handler2(1,token,[]);
    return true;
  }

  /**
   * seleccionar checkbox
   * @param {int} i indice del checkbox que se seleccionará
   * @param {String} calificacion_pv texto de calificacion del punto de venta
   */
  SetChecked(i,calificacion_pv)
  {
    var mercadeo = this.state.mercadeo;
    var data = this.state.relacion_vendedores;
    var data2 = this.state.senalizacion;
    if(calificacion_pv === 'Si' || calificacion_pv === 'No' || calificacion_pv === 'Bueno' || calificacion_pv === 'Malo'){
      var docs = this.state.documentos;
      docs.estado_documento = calificacion_pv;
      docs.estado_condicion = calificacion_pv;
      this.setState({ checked2: i, documentos: docs });
    }
    else if(calificacion_pv === 'Favorable' || calificacion_pv === 'Desfavorable'){
      this.setState({ checked2: i});
    }
    else if(calificacion_pv === '  Si' || calificacion_pv === '  No' || calificacion_pv === '  N/A'){
      data2[this.state.selected].respuesta = i;
      this.setState({ senalizacion: data2});
    }
    else if(calificacion_pv === ' Si' || calificacion_pv === ' No'){
      data[this.state.selected].conoce_objetivos = i;
      this.setState({ relacion_vendedores: data});
    }
    else if(calificacion_pv === ' Buena' || calificacion_pv === ' Mala'){
      data[this.state.selected].presentacion_personal = i;
      this.setState({ relacion_vendedores: data});
    }
    else if(calificacion_pv === ' Si ' || calificacion_pv === ' No '){
      data[this.state.selected].conoce_indicados = i;
      this.setState({ relacion_vendedores: data});
    }
    else if(calificacion_pv === ' Si  ' || calificacion_pv === ' No  '){
      data[this.state.selected].porta_carnet = i;
      this.setState({ relacion_vendedores: data});
    }
    else if(calificacion_pv === ' Si   ' || calificacion_pv === ' No   '){
      this.setState({ aplica_proceso_ideal_venta: i});
    }
    else if(calificacion_pv === 'Si ' || calificacion_pv === 'No '){
      var arr = this.state.ptc;
      var ind = 0;
      if(items.nombre_tabla === 'actividades_ptc'){
        if(calificacion_pv === 'Si ')
        {
          ind = i-5;
          arr[ind].respuesta = 5;
        }
        else{
          ind = i-1;
          arr[ind].respuesta = 1
        }
        this.setState({ ptc:arr});
      }
      //console.log(arr);
    }
    else if(calificacion_pv === 'Si  ' || calificacion_pv === 'No  '){
      mercadeo.promociones_separata = i;
      this.setState({ mercadeo: mercadeo});
    }
    else if(calificacion_pv === 'Si   ' || calificacion_pv === 'No   '){
      mercadeo.desc_escalonados = i;
      this.setState({ mercadeo: mercadeo});
    }
    else if(calificacion_pv === 'Si    ' || calificacion_pv === 'No    '){
      mercadeo.tienda_virtual = i;
      this.setState({ mercadeo: mercadeo});
    }
    else if(calificacion_pv === 'Si     ' || calificacion_pv === 'No     '){
      mercadeo.puntos_saludables = i;
      this.setState({ mercadeo: mercadeo});
    }
    else if(calificacion_pv === 'Si      ' || calificacion_pv === 'No      '){
      mercadeo.close_up = i;
      this.setState({ mercadeo: mercadeo});
    }
    else{
      this.setState({ checked: i, calificacion_pv: calificacion_pv });
    }
  }

  /**
   * Enviar calificaciones de la actividad a la base de datos
   * @param {function} handler ir al layout de home luego de enviar los datos.
   * #00ff00
   */
  async FinishActivity(handler)
  {
    Keyboard.dismiss;
    this.setState({loading2:true});
    var that = this;
    let bodyInit = JSON.parse(token._bodyInit);
    let handler2 = this.props.handler2;
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    let id = items.id_actividad;
    this._storeData();
    this._storeDataAusente();
    var totalTl = new Date().getTime();
    totalTime = totalTl - totalTimeInit;
    var diferencia = 0;
    var mes_actual;
    var dias_transcurridos;
    diferencia = items.nombre_tabla === 'evolucion_clientes' ?(this.state.ano_actual - this.state.ano_anterior) : this.state.diferencia;
    items.nombre_tabla === 'servicio_bodega' ? diferencia = this.state.bodega.diferencia : null
    mes_actual = items.nombre_tabla === 'domicilios' ? this.state.domicilios.mes_actual : this.state.julienne.mes_actual;
    dias_transcurridos = items.nombre_tabla === 'domicilios' ? this.state.domicilios.dia_actual : this.state.julienne.dia_actual;
    var arr = this.state.ptc;
    let file1 = '';
    if(items.nombre_tabla === 'solicitud_seguro' || items.nombre_tabla === 'contratos_anexos_legalizacion'){
      if(this.state.archivo.hasOwnProperty('uri')){
        await Expo.FileSystem.readAsStringAsync(this.state.archivo.uri, {encoding: Expo.FileSystem.EncodingTypes.Base64}).then(function(response){
          file1 = response;
        });
      }
      else{
        if(items.seguro !== '' && items.seguro !== null){
          file1 = this.state.imgVencido;
        }
      }
    }
    //console.log(file1);
    /** Motivo de Ausencia */
    if(this.state.ausencia){
      if(items.motivo_ausencia === 'no ausentado'){
        items.motivo_ausencia = BUTTONS[this.state.motivo];
      }
      else{
        items.motivo_ausencia = items.motivo_ausencia + ',' + BUTTONS[this.state.motivo];
      }
    }
    await fetch(api.ipActivity, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
        'Accept':'application/json'
      },
      body: JSON.stringify({
        calificacion_pv: this.state.checked,//this.state.calificacion_pv, 
        nombre_tabla: items.nombre_tabla,
        id_plan_trabajo: items.id_plan_trabajo, 
        id_actividad: id,
        observaciones: this.state.observacion,
        productos: JSON.stringify(this.state.PRODUCTS),
        numero_consecutivo:this.state.numero_consecutivo,
        laboratorios_realizados: JSON.stringify(this.state.PRODUCTS2),
        laboratorios: JSON.stringify(this.state.LABORATORIES),
        ano_actual:this.state.ano_actual,
        ano_anterior:this.state.ano_anterior,
        base:this.state.base,
        gastos:this.state.gastos,
        sobrante:this.state.sobrante,
        faltante:this.state.faltante,
        diferencia:Math.abs(diferencia),
        horario: JSON.stringify(this.state.horario),
        mes_anterior: this.state.domicilios.mes_anterior,
        venta_domicilios_proyeccion: this.state.domicilios.venta_proyeccion,
        numero_mensajeros_planta: this.state.domicilios.num_mensajeros,
        pro_domicilio_mensajero: this.state.domicilios.prom_domicilio_mensajero,
        mes_actual: mes_actual,
        dias_transcurridos: dias_transcurridos,
        consecutivos: this.state.remisiones.consecutivos,
        numero_remisiones: this.state.remisiones.numero_remisiones,        
        promociones_separata: this.state.mercadeo.promociones_separata,
        desc_escalonados: this.state.mercadeo.desc_escalonados,
        tienda_virtual: this.state.mercadeo.tienda_virtual,
        puntos_saludables: this.state.mercadeo.puntos_saludables,
        close_up: this.state.mercadeo.close_up,
        correspondencia:this.state.correspondencia,
        valor_pedido:this.state.bodega.valor_pedido,
        valor_despacho:this.state.bodega.valor_despacho,
        nivel_servicio:this.state.bodega.nivel_servicio,
        revisa_pedidos_antes_enviarlos:this.state.bodega.revisa_pedidos_antes_enviarlos,
        utiliza_libreta_faltantes:this.state.bodega.utiliza_libreta_faltantes,
        valor_actual:this.state.mercancia.valor_actual,
        dias_inventario:this.state.mercancia.dias_inventario,
        inv_optimo:this.state.mercancia.inv_optimo,
        valor_dev_cierre_mes:this.state.mercancia.valor_dev_cierre_mes,
        dev_vencimiento_m_estado:this.state.mercancia.dev_vencimiento_m_estado,     
        productos_cero: JSON.stringify(this.state.PRODUCTS),
        productos_cero_rotante_90_dias: JSON.stringify(this.state.PRODUCTS2),  
        acciones_tomadas: this.state.acciones_tomadas,   
        productos_no_rotan: JSON.stringify(this.state.PRODUCTS),     
        proximos_vencer: JSON.stringify(this.state.PRODUCTS2),
        venta_mes_anterior: this.state.julienne.mes_anterior,
        proyeccion_mes_actual: this.state.julienne.venta_proyeccion,
        relacion_faltantes: JSON.stringify(this.state.PRODUCTS), 
        consumo: JSON.stringify(this.state.servicios_publicos),
        examen: JSON.stringify(this.state.examen),
        senalizacion: JSON.stringify(this.state.senalizacion),
        seguro: file1,
        contrato: file1,
        relacion_vendedores: JSON.stringify(this.state.relacion_vendedores),
        aplica_proceso_ideal_venta:this.state.aplica_proceso_ideal_venta,
        implementar_estrategia:this.state.estrategia,
        compromiso:this.state.compromiso,
        fecha_resolucion:this.state.fecha_resolucion,
        numero_facturas_autorizadas:this.state.facturas_autorizadas,
        fecha_ultima_factura:this.state.fecha_ultima_factura,
        numero_ultima_factura:this.state.numero_ultima_factura,
        data:JSON.stringify(arr),
        tiempo_actividad: time,
        tiempo_total: totalTime,
        motivo_ausencia: items.motivo_ausencia
      })
    }).then(function(response) {
      console.log(response);
      newToken = JSON.parse(response._bodyInit);
      var message = "message";
      if(response.ok === true && response.status === 200)
      {
        toastr.showToast(newToken[message],'success');
        that.setState({loading2:false});
        handler(1,token,[]);
      }
      else
      {
        console.log(response);
        that.setState({loading2:false});
        if(response.status === 500){
          toastr.showToast('Error con el servidor','danger');
          var header = JSON.stringify({ok:response.ok, status:response.status, statusText:response.statusText, type:response.type, url:response.url});
          var body = JSON.stringify({message:newToken.message,exception:newToken.exception,file:newToken.file,line:newToken.line});
          logError.sendError(header,body,auth);
        }
        else if(response.status === 401){
          toastr.showToast('Su sesión expiró','danger');
          handler2(-1,token,[]);
        }
        else{
          toastr.showToast(newToken[message],'warning');
        }
      }
    }).catch(function(error){
      toastr.showToast('Su sesión expiró','danger');
      that.setState({loading2:false});
      handler2(-1,token,[]);
      console.log(error);
    });
  }
  
  /**
   * Guardar datos del tiempo actual del plan de trabajo
   */
  _storeData = async () => {
    var tl = new Date();
    tl.setMilliseconds(tl.getMilliseconds() + parseFloat(time));
    var timeLast = tl.getTime();
    time = timeLast-timeInit;
    try {
      await AsyncStorage.setItem('TIME_' + items.nombre_tabla + '_' + items.id_actividad, time.toString());
      //console.log("tiempo: " + time);
    } catch (error) {
      console.log(error);
    }
    /* Borrar datos
    try {
      await AsyncStorage.removeItem('TIME_' + items.nombre_tabla + '_' + items.id_actividad);
    } catch (error) {
      console.log(error);
    }*/
  }

  /**
   * Guardar datos del tiempo inicial del plan de trabajo
   */
  _storeDataInit = async () => {
    var tl = new Date();
    var timeLast = tl.getTime();
    totalTimeInit = timeLast;
    try {
      await AsyncStorage.setItem('TIMEINIT_' + items.nombre_tabla + '_' + items.id_actividad, totalTimeInit.toString());
      //console.log("*TOTAL TIME INIT: " + totalTimeInit);
    } catch (error) {
      console.log(error);
    }
    /* Borrar datos
    try {
      await AsyncStorage.removeItem('TIMEINIT_' + items.nombre_tabla + '_' + items.id_actividad);
    } catch (error) {
      console.log(error);
    }*/
  }

  /**
   * Guardar datos del tiempo inicial de ausencia en el plan de trabajo
   */
  _storeDataAusente = async () => {
    var tl = new Date().getTime();

    var porcentajes = this.state.porcentajes;
    var general = ((porcentajes.porcentaje_general.actividades_completas) / porcentajes.porcentaje_general.todas_las_actividades) * 100;
    if(items.estado === 1){
      porcentajes.porcentaje_general.actividades_completas = porcentajes.porcentaje_general.actividades_completas+1;
      general = ((porcentajes.porcentaje_general.actividades_completas) / porcentajes.porcentaje_general.todas_las_actividades) * 100;
    }
    try {
      await AsyncStorage.multiSet([['TIME_AUSENTE_' + items.nombre_tabla + '_' + items.id_actividad, tl.toString()],['PORCENTAJE',''+Math.floor(general)],['PORCENTAJES',JSON.stringify(porcentajes)]]);
      //console.log("*TIME_AUSENTE: " + totalTimeInit);
    } catch (error) {
      console.log(error);
    }
    /* Borrar datos
    try {
      await AsyncStorage.removeItem('TIME_AUSENTE_' + items.nombre_tabla + '_' + items.id_actividad);
    } catch (error) {
      console.log(error);
    }*/
  }

  /**
   * Obtener datos de tiempo actual del plan de trabajo
   * Obtener datos de tiempo inicial del plan de trabajo
   * Obtener datos de tiempo inicial de ausencia en el plan de trabajo
   */
  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.multiGet(['TIME_' + items.nombre_tabla + '_' + items.id_actividad,'TIMEINIT_' + items.nombre_tabla + '_' + items.id_actividad,'TIME_AUSENTE_' + items.nombre_tabla + '_' + items.id_actividad,'PORCENTAJES']);
      if (value[0][1] !== null) {
        time = value[0][1];
        //console.log("TIME: " + time);
      }
      if (value[1][1] !== null) {
        totalTimeInit = value[1][1];
        //console.log("TOTAL TIME INIT: " + totalTimeInit);
      }
      else{this._storeDataInit()}
      if (value[2][1] !== null) {
        var t2 = new Date().getTime().toString();        
        var TiempoInact = 0;
        if(items.tiempoInactivoInit !== 0 && items.tiempoInactivoInit > totalTimeInit){
          TiempoInact = items.tiempoInactivo;
        }
        if((t2 - value[2][1]) - TiempoInact > TIEMPOAUSENCIA){        
          this.setState({
            motivo: '0',
            ausencia: true
          });          
        }
        //console.log("TIME AUSENTE: " + totalTimeInit);
      }
      if(value[3][1] !== null){
        this.setState({porcentajes: JSON.parse(value[3][1])});
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Seleccionar un archivo desde el UI del dispositivo
   * @param {boolean} vencido verifica si se va a modificar la imagen de documento vencido
   */
  openFilePicker = async (vencido,index) => {
    try{
      let file = await Expo.DocumentPicker.getDocumentAsync({type: '*/*'});
      //console.log(file);
      if (file.type == "success") {
        var tipo = file.name.split('.')[1];
        let attachment = {
          name: file.name,
          uri: file.uri,
          type: "file",
          file_type: tipo
        };
        //console.log(attachment);
        if(index === -1){
          if(vencido){
            imgTemp1 = attachment.uri;
            this._img1.setNativeProps({src: [{uri: imgTemp1}]});
            this.setState({archivo: attachment, imgVencido: imgTemp1});
          }else{
            imgTemp2 = attachment.uri;
            this._img2.setNativeProps({src: [{uri: imgTemp2}]});//'data:image/png;base64,' + imgsource
            this.setState({archivo2: attachment, imgRenovado: imgTemp2});
          }
        }
        else{
          imgTemp1 = attachment.uri;
          var file64;
          var arr = this.state.ptc;
          await Expo.FileSystem.readAsStringAsync(imgTemp1, {encoding: Expo.FileSystem.EncodingTypes.Base64}).then(function(response){
            file64 = response;
          });
          arr[index].respuesta = file64;
          this._imgs[index].setNativeProps({src: [{uri: imgTemp1}]});
          this.setState({ptc: arr, archivo: attachment, imgVencido: imgTemp1});
        }
      }
    }
    catch(error){
      console.log(error);
    }
  }

  async setImage(attachment){
    this.setState({isVisibleCam:false})
    imgTemp1 = attachment.uri;
    imgTemp2 = attachment.uri;
    if(this.state.takePicture.index === -1){
      if(this.state.takePicture.vencido){
        this._img1.setNativeProps({src: [{uri: imgTemp1}]});
        this.setState({archivo: attachment, imgVencido: imgTemp1});
      }
      else{
        this._img2.setNativeProps({src: [{uri: imgTemp2}]});
        this.setState({archivo2: attachment, imgRenovado: imgTemp2});
      }
    }
    else{
      var file64;
      var arr = this.state.ptc;
      await Expo.FileSystem.readAsStringAsync(imgTemp1, {encoding: Expo.FileSystem.EncodingTypes.Base64}).then(function(response){
        file64 = response;
      });
      arr[index].respuesta = file64;
      this._imgs[index].setNativeProps({src: [{uri: imgTemp1}]});
      this.setState({ptc: arr, archivo: attachment, imgVencido: imgTemp1});
    }
  }

  /**
   * Muestra el overlay con la imagen en pantalla completa
   * @param {boolean} vencido 
   */
  verImagen(vencido, index){
    if(index === -1){
      if(vencido){
        imgOverlay = this.state.imgVencido;
      }
      else{imgOverlay = this.state.imgRenovado;}
    }
    else{
      imgOverlay = this.state.ptc[index].respuesta.length > 500 ? 'data:image/png;base64,' + this.state.ptc[index].respuesta : api.ipImg + this.state.ptc[index].respuesta 
    }
    this.setState({isVisible2: true});
  }

  /** buscar productos */
  BuscarProducto(query, lab, index){
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    let prods = [];
    var that = this;
    let {query2} = this.state;
    if(index !== -1){
      query2[index] = query;
    }
    var array = [...this.state.productos2];
    let {productos2} = this.state;
    if(query !== ''){
      fetch(api.ipBuscarProducto, {
        method: 'POST',
        headers: {
            'Authorization': auth,
            'Content-Type': 'application/json',
            'Accept':'application/json'
        },
        body: JSON.stringify({
          nombre_producto: query.toLowerCase(),
          laboratorio: lab
        })
      }).then(function(response) {
        //console.log(response);
        if(response.ok === true && response.status === 200)
        {
          newToken = JSON.parse(response._bodyInit);
          //console.log(newToken);
          Object.values(newToken.productos['data']).forEach(element => {
            //console.log(element);
            prods.push({nombre_comercial:element.nombre_comercial, laboratorio_id: element.laboratorio_id, codigo: element.codigo});
          });
          //console.log(prods)
          if(index !== -1){
            array[index] = {...array[index], prods: prods};
            that.setState({productos: prods, query: lab === '' ? query : (items.nombre_tabla === 'gimed' || items.nombre_tabla === 'examen_gimed' ? query : ''), query2, productos2: array});
          }else{that.setState({productos: prods, query3: query, query2, productos2: array});}
        }
        else
        {
          console.log(response);
          var newToken = JSON.parse(response._bodyInit);
          var header = JSON.stringify({ok:response.ok, status:response.status, statusText:response.statusText, type:response.type, url:response.url});
          var body = JSON.stringify({message:newToken.message,exception:newToken.exception,file:newToken.file,line:newToken.line});
          if(response.status === 500){
            toastr.showToast('Error con el servidor','danger');
            logError.sendError(header,body,auth);
          }
          else if(response.status === 401){
            toastr.showToast('Su sesión expiró','danger');
            handler2 = true;
          }
          else{
            toastr.showToast('No se encontraron productos','warning');
            array[index] = {...array[index], prods: prods};
            that.setState({productos: prods, query: query, query2, productos2:array});
          }
        }
        //return response.json();
      }).catch(function(error){
        toastr.showToast('Su sesión expiró','danger');
        handler2 = true;
        console.log(error);
      });
    }
    else{array[index] = {...array[index], prods: prods}; this.setState({productos: prods, query: query, query2,productos2:array});}
  }

  /** buscar Laboratorios */
  BuscarLaboratorio(query){
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    let labs = [];
    var that = this;
    if(query !== ''){
      fetch(api.ipBuscarLaboratorio, {
        method: 'POST',
        headers: {
            'Authorization': auth,
            'Content-Type': 'application/json',
            'Accept':'application/json'
        },
        body: JSON.stringify({
          laboratorio: query.toLowerCase()
        })
      }).then(function(response) {
        //console.log(response);
        if(response.ok === true && response.status === 200)
        {
          newToken = JSON.parse(response._bodyInit);
          //console.log(newToken);
          Object.values(newToken.laboratorios['data']).forEach(element => {
            //console.log(Object.values(element));
            labs.push({nombre: element.nombre, dk: element.dk});
          });
          //console.log(labs)
          that.setState({laboratorios: labs,query3:query});
        }
        else
        {
          console.log(response);
          var newToken = JSON.parse(response._bodyInit);
          var header = JSON.stringify({ok:response.ok, status:response.status, statusText:response.statusText, type:response.type, url:response.url});
          var body = JSON.stringify({message:newToken.message,exception:newToken.exception,file:newToken.file,line:newToken.line});
          if(response.status === 500){
            toastr.showToast('Error con el servidor','danger');
            logError.sendError(header,body,auth);
          }
          else if(response.status === 401){
            toastr.showToast('Su sesión expiró','danger');
            handler2 = true;
          }
          else{
            toastr.showToast('No se encontraron Laboratorios','warning');
            that.setState({laboratorios: labs,query3:query});
          }
        }
        //return response.json();
      }).catch(function(error){
        toastr.showToast('Su sesión expiró','danger');
        handler2 = true;
        console.log(error);
      });
    }else{this.setState({laboratorios: labs,query3:query});}
  }

  /**
   * Buscar y Filtrar Productos
   */
  findProduct(query) {
    if (query === '' || query === undefined) {
      return [];
    }
    //console.log(this.state.productos);
    return this.state.productos.filter(prod => prod.nombre_comercial.toLowerCase().indexOf(query.toLowerCase()) >= 0);//this.state.productos.filter(prod => prod.nombre_comercial.toLowerCase().search(query.toLowerCase()) >= 0);
  }

  /**
   * Borrar Producto de la lista PRODUCTS
   */
  BorrarProducto(item,index2){
    var array = [...this.state.PRODUCTS];
    var index = array.indexOf(item)

    var array2 = [...this.state.PRODUCTS2];
    var index3 = -1;
    if(index2 !== undefined){
      index3 = array2[index2].prods.indexOf(item)
    }
    if (index !== -1) {
      array.splice(index, 1);
    }
    if (index3 !== -1) {
      array2[index2].prods.splice(index3,1);
    }
    this.setState({PRODUCTS: array, PRODUCTS2:array2});
  }

  /**
   * Modificar Producto de la lista PRODUCTS
   */
  ModificarProducto(item,value,index2){
    var array = [...this.state.PRODUCTS];
    var index = array.indexOf(item);

    var array2 = [...this.state.PRODUCTS2];
    var index3 = -1;
    if(index2 !== undefined){  
      index3 = array2[index2].prods.indexOf(item);
    }
    if (index !== -1) {
      array[index] = {...array[index], cant: value};
      //console.log(array);
    }
    if (index3 !== -1) {
      array2[index2].prods[index3] = {...array2[index2].prods[index3], cant: value};
    }
    this.setState({PRODUCTS: array, PRODUCTS2: array2});
    this.forceUpdate();
  }

  /**
   * Modificar Lab de la lista LABORATORIES
   */
  ModificarLab(item,value,tipo){
    var array = [...this.state.LABORATORIES];
    var index = array.indexOf(item);

    if (index !== -1) {
      if(tipo === 1){
        array[index] = {...array[index], entrepa: value};
      }
      else{
        array[index] = {...array[index], estantes: value};
      }
    }
    this.setState({LABORATORIES: array});
    this.forceUpdate();
  }

  /**
   * Modificar datos del ptc
   * @param index posicion del item a modificar en el array del ptc
   * @param tipo tipo de modificacion @example tipo: 1 = productos , tipo: 2 = laboratorios
   */
  updatePTC(index, tipo){
    var array = this.state.ptc;
    if(tipo === 1){array[index].respuesta = this.state.PRODUCTS;}
    else if(tipo === 2){array[index].respuesta = this.state.PRODUCTS2;}
    this.setState({ptc:array});
  }

  /** Cambiar opcion de motivo de ausencia */
  onValueChange(value) {
    this.setState({
      motivo: value
    });
  }
  /** Cambiar fecha de vencimiento */
  setDate(newDate,item) {
    var array = [...this.state.PRODUCTS];
    var index = array.indexOf(item);
    if (index !== -1) {
      array[index] = {...array[index], fecha_vencimiento: newDate};
      //console.log(array);
      this.setState({chosenDate: newDate, PRODUCTS: array});
      this.forceUpdate();
    }
  }

  /**
   * Formato de moneda
   */
  NumberFormat(value){
    //console.log(value.split("").reverse().reduce(function(AntValue,CurrentValue,CurrentIndex,array){return  CurrentValue + (CurrentIndex && !(CurrentIndex % 3) ? "." : "") + AntValue}, ""));
    if(value !== null){
      var val = ''+value;
      if(val.length > 0){
        return val.split("").reverse().reduce(function(AntValue,CurrentValue,CurrentIndex,array){return  CurrentValue + (CurrentIndex && !(CurrentIndex % 3) ? "." : "") + AntValue}, "")
      }
      else{
        return val
      }
    }
    else{return ''}
  }

  /**
   * Cerrar el teclado despues de x tiempo
   * @param x tiempo de espera para cerrar el teclado
   */
  closeKeyBoard(x){
    clearTimeout(closingKeyboard);
    closingKeyboard = setTimeout(function () {
      Keyboard.dismiss()      
    }, x*1000);
  }

  /**
   * cerrar SideBar
   */
  closeDrawer(){
    this.drawer._root.close();
  }

  render() {
    /***
     * Mostrar layout luego de cargar los datos
     */
    if (this.state.loading) {
      return (<View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color={COLOR.azul} /></View>);
    }
    
    const { query,query3 } = this.state;
    const prods = this.findProduct(query);
    const prods2 = this.findProduct(query3);
    const labs = this.state.laboratorios;

    return (
      <Drawer
        ref={(ref) => { this.drawer = ref; }}
        content={<SideBar handler={this.props.handler} handler2={this.props.handler2} rol={1} layout={-1} token={token} data={this.props.data} indexArray={this.props.indexArray} _retrieveData={this._retrieveData} closeDrawer={this.closeDrawer}/>}
        onClose={() => this.drawer._root.close()} 
        initializeOpen={false}
        openDrawerOffset={0}
        panOpenMask={.05}
        panCloseMask={.02}
        styles={{ drawer: { shadowColor: "#000000",shadowOpacity: 0,shadowRadius: 0,elevation: 5,},mainOverlay:{opacity: 0,backgroundColor:'#00000000', elevation:8}}}
        >
        <Container>
          <Expo.LinearGradient
            colors={['#FF3153', '#FF7B3D']}
            start={[0,.5]}
            end={[1,.5]}
            style={IconStyles.gradient}>
            <Header hasTabs style={IconStyles.navbar}>
              <Left>
                <Button transparent onPress={() => this.drawer._root.open()}>
                  {/* <Icon ios="ios-menu" android="md-menu" style={IconStyles.menu}></Icon> */}
                  <Image style={IconStyles.menu2} source={Imagen.home}></Image>
                </Button>
              </Left>
              <Body>
                {/* <Title>{items.sucursal}</Title> */}
              </Body>
              <Right style={{marginRight:10}}>          
                <Button transparent onPress={() => this.setState({isVisible: true})}>
                    <Icon ios="ios-help" android="md-help" style={IconStyles.help}></Icon>
                </Button>
              </Right>
            </Header>
          </Expo.LinearGradient>
          <KeyboardAvoidingView behavior="padding" enabled style={{flex: Platform.OS === 'ios' ? 1 : 1}}>
            <Content keyboardShouldPersistTaps='true'>
              <Text style={styles.sucursal}>{items.sucursal}</Text>
              <H2 style={styles.actividad}>{items.name}</H2>
              <Card style={{marginBottom: 10, marginTop: 10, elevation:0, borderColor:'rgba(255,255,255,0)'}}>
                {
                  items.nombre_tabla === 'apertura' ?
                    <View>
                      <Text style={styles.textInfo}>Hora de apertura: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Puntual'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={3} value={'Tarde'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Muy Tarde'} checked={this.state.checked}></RadioButton>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Horario días Hábiles: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Apertura" defaultValue={this.state.horario.dias_habiles.apertura} onChangeText={text => {var hr = this.state.horario; hr.dias_habiles.apertura = text; this.setState({horario: hr})} }></Input>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Cierre" defaultValue={this.state.horario.dias_habiles.cierre} onChangeText={text => {var hr = this.state.horario; hr.dias_habiles.cierre = text; this.setState({horario: hr})}}></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Domingos y Feriados: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Apertura" defaultValue={this.state.horario.domingos_feriados.apertura} onChangeText={text => {var hr = this.state.horario; hr.domingos_feriados.apertura = text; this.setState({horario: hr})} }></Input>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Cierre" defaultValue={this.state.horario.domingos_feriados.cierre} onChangeText={text => {var hr = this.state.horario; hr.domingos_feriados.cierre = text; this.setState({horario: hr})} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Turnos Domingos y Feriados: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Primer Turno" defaultValue={this.state.horario.domingos_feriados.primer_turno} onChangeText={text => {var hr = this.state.horario; hr.domingos_feriados.primer_turno = text; this.setState({horario: hr})} }></Input>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Segundo Turno" defaultValue={this.state.horario.domingos_feriados.segundo_turno} onChangeText={text => {var hr = this.state.horario; hr.domingos_feriados.segundo_turno = text; this.setState({horario: hr})} }></Input>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Tercer Turno" defaultValue={this.state.horario.domingos_feriados.tercer_turno} onChangeText={text => {var hr = this.state.horario; hr.domingos_feriados.tercer_turno = text; this.setState({horario: hr})} }></Input>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'kardex' ?
                    <View>
                      <Text style={styles.textInfo}>Elaboración: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <FlatList data={this.state.LABORATORIES}
                        extraData={this.state}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item,index}) =>
                          <View key={Math.floor(Math.random() * 1000) + 1}>

                            <Text style={styles.textDocumento}>{item.nuevo ?<Icon onPress={() => {var array = [...this.state.LABORATORIES]; var array2 = [...this.state.productos2]; array.splice(index,1); array2.splice(index,1); this.setState({LABORATORIES: array, PRODUCTS2: array, productos2:array2});}} ios='ios-trash' android="md-trash" style={{color: '#d9534f', fontSize: 20}}></Icon>:null} Laboratorio: {item.nombre}</Text>
                            <Text style={styles.textDocumento}>Productos faltantes o sobrantes: </Text>
                            <Autocomplete
                              autoCapitalize="none"
                              data={this.state.productos2[index].prods}
                              defaultValue={this.state.query2[index]}
                              onChangeText={() => this.closeKeyBoard(1)}
                              onEndEditing={text => this.BuscarProducto(text.nativeEvent.text,item.dk,index)}
                              placeholder="Producto a buscar"
                              inputContainerStyle={styles.autocompletar}
                              listStyle={styles.autocompletarLista}
                              renderItem={item => 
                                (
                                  <TouchableOpacity onPress={() => {let {query2,PRODUCTS2,productos2} = this.state; query2[index] = ''; productos2[index].prods = []; var prods = PRODUCTS2[index].prods; prods.push({nombre_comercial:item.nombre_comercial,cant:1,codigo:item.codigo,laboratorio_id:item.laboratorio_id}); PRODUCTS2[index] = {...PRODUCTS2[index], prods: prods }; this.setState({ query2 , PRODUCTS2, productos2 }) } }>
                                    <Text style={styles.producto}>{item.nombre_comercial}</Text>
                                  </TouchableOpacity>
                                )
                              }
                            />
                            <List key={Math.floor(Math.random() * 1000) + 1} dataArray={this.state.PRODUCTS2[index].prods}
                              renderRow={(item) =>
                                <View style={{flex:1, flexDirection:'row', justifyContent:'space-between'}}>
                                  <View style={{flex:2, justifyContent:'flex-start'}}>
                                    <ListItem button onPress={() => this.BorrarProducto(item,index)}>
                                      <Icon ios='ios-trash' android="md-trash" style={{color: '#d9534f', fontSize: 20}}></Icon>
                                      <Text style={styles.productosList}>{item.nombre_comercial}</Text>
                                    </ListItem>
                                  </View>
                                  <View style={{flex:1, justifyContent:'center'}}>
                                    <NumericInput borderColor={'rgba(255,255,255,0)'} textColor={COLOR.azul} iconStyle={{color:'white'}} rightButtonBackgroundColor={COLOR.azul} leftButtonBackgroundColor={COLOR.azul} rounded minValue={-999} maxValue={999} initValue={item.cant} value={item.cant} onChange={value => this.ModificarProducto(item,value,index)}/>
                                  </View>
                                </View>
                              }>
                            </List>
                          </View>
                        }>
                      </FlatList>
                      <Text style={styles.textDocumento}>Agregar Laboratorio: </Text>
                      <Autocomplete
                        autoCapitalize="none"
                        data={labs}
                        defaultValue={query3}
                        onChangeText={text => this.BuscarLaboratorio(text)}
                        placeholder="Laboratorio a buscar"
                        inputContainerStyle={styles.autocompletar}
                        listStyle={styles.autocompletarLista}
                        renderItem={item => (
                          <TouchableOpacity onPress={() => {var array = [...this.state.PRODUCTS2]; var array2 = [...this.state.productos2]; array.push({dk:item.dk, nombre:item.nombre,prods:[],nuevo:true}); array2.push({index: array2.length,prods:[]}); this.setState({ query3: '', laboratorios:[], PRODUCTS2:array, LABORATORIES:array,productos2:array2 })} }>
                            <Text style={styles.producto}><Icon ios='ios-add-circle-outline' android="md-add-circle-outline" style={{color: COLOR.verde, fontSize: 20}}></Icon> {item.nombre}</Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'condiciones_locativas' ?
                    <View>
                      <Text style={styles.textInfo}>Condiciones: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Excelentes'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={4} value={'Buenas'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={3} value={'Regulares'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={2} value={'Malas'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pesimas'} checked={this.state.checked}></RadioButton>
                      
                      <Picker
                          textStyle={styles.picker}
                          mode="dropdown"
                          iosIcon={<Icon name="arrow-down" />}
                          placeholder="Selecciona una opción"
                          selectedValue={this.state.selected}
                          style={{ width: undefined,marginLeft:15, marginRight:15 }}
                          itemStyle={styles.picker}
                          itemTextStyle={{textTransform:'lowercase'}}
                          onValueChange={value => this.setState({selected:value})}
                        >                      
                          {this.state.lista}
                      </Picker>
                      <Button iconLeft regular block info style={[styles.boton, styles.actualizar]} onPress={() => this.AccederCondicion() }><Image style={styles.iconoBoton} source={Imagen.find}></Image><Text style={styles.textButton}>Modificar Datos</Text></Button>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'exhibiciones' ?
                    <View>
                      <Text style={styles.textInfo}>Verificar permanencia de las exhibiciones: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <Text style={styles.textDocumento}>Productos en exhibición: </Text>
                      <Autocomplete
                        autoCapitalize="none"
                        data={prods}
                        defaultValue={query}
                        onChangeText={text => this.BuscarProducto(text,'',0)}
                        placeholder="Producto a buscar"
                        inputContainerStyle={styles.autocompletar}
                        listStyle={styles.autocompletarLista}
                        renderItem={item => (
                          <TouchableOpacity onPress={() => this.setState({ query: '', PRODUCTS: [...this.state.PRODUCTS, {nombre_comercial:item.nombre_comercial,cant:1,codigo:item.codigo,laboratorio_id:item.laboratorio_id}] }) }>
                            <Text style={styles.producto}>{item.nombre_comercial}</Text>
                          </TouchableOpacity>
                        )}
                      />
                      <List dataArray={this.state.PRODUCTS}
                        renderRow={(item) =>
                          <View style={{flex:1, flexDirection:'row', justifyContent:'space-between'}}>
                            <View style={{flex:2, justifyContent:'flex-start'}}>
                              <ListItem button onPress={() => this.BorrarProducto(item)}>
                                <Icon ios='ios-trash' android="md-trash" style={{color: '#d9534f', fontSize: 20}}></Icon>
                                <Text style={styles.productosList}>{item.nombre_comercial}</Text>
                              </ListItem>
                            </View>
                          </View>
                        }>
                      </List>
                      <FlatList data={this.state.LABORATORIES}
                        extraData={this.state}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item,index}) =>
                          <View key={Math.floor(Math.random() * 1000) + 1}>
                            <Text style={styles.textDocumento}>{item.nuevo ?<Icon onPress={() => {var array = [...this.state.LABORATORIES]; var array2 = [...this.state.productos2]; array.splice(index,1); array2.splice(index,1); this.setState({LABORATORIES: array, PRODUCTS2: array, productos2:array2});}} ios='ios-trash' android="md-trash" style={{color: '#d9534f', fontSize: 20}}></Icon>:null} Laboratorio: {item.nombre}</Text>
                            <View style={{flexDirection:'row'}}>
                              <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
                                <Text style={[styles.textDescFoto,{marginTop:0}]}>Estantes</Text> 
                                <NumericInput borderColor={'rgba(255,255,255,0)'} textColor={COLOR.azul} iconStyle={{color:'white'}} rightButtonBackgroundColor={COLOR.azul} leftButtonBackgroundColor={COLOR.azul} rounded minValue={0} maxValue={999} initValue={item.estantes} value={item.estantes} onChange={value => this.ModificarLab(item,value,2)}/>
                              </View>
                              <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
                                <Text style={[styles.textDescFoto,{marginTop:0}]}>Entrepaños</Text>
                                <NumericInput borderColor={'rgba(255,255,255,0)'} textColor={COLOR.azul} iconStyle={{color:'white'}} rightButtonBackgroundColor={COLOR.azul} leftButtonBackgroundColor={COLOR.azul} rounded minValue={0} maxValue={999} initValue={item.entrepa} value={item.entrepa} onChange={value => this.ModificarLab(item,value,1)}/>
                              </View>
                            </View>
                            <Text style={styles.textDocumento}>Productos: </Text>
                            <Autocomplete
                              autoCapitalize="none"
                              data={this.state.productos2[index].prods}
                              defaultValue={this.state.query2[index]}
                              onChangeText={() => this.closeKeyBoard(1)}
                              onEndEditing={text => this.BuscarProducto(text.nativeEvent.text,item.dk,index)}
                              placeholder="Producto a buscar"
                              inputContainerStyle={styles.autocompletar}
                              listStyle={styles.autocompletarLista}
                              renderItem={item => 
                                (
                                  <TouchableOpacity onPress={() => {let {query2,PRODUCTS2,productos2} = this.state; query2[index] = ''; productos2[index].prods = []; var prods = PRODUCTS2[index].prods; prods.push({nombre_comercial:item.nombre_comercial,cant:1,codigo:item.codigo,laboratorio_id:item.laboratorio_id}); PRODUCTS2[index] = {...PRODUCTS2[index], prods: prods }; this.setState({ query2 , PRODUCTS2, productos2 }) } }>
                                    <Text style={styles.producto}>{item.nombre_comercial}</Text>
                                  </TouchableOpacity>
                                )
                              }
                            />
                            <List key={Math.floor(Math.random() * 1000) + 1} dataArray={this.state.PRODUCTS2[index].prods}
                              renderRow={(item) =>
                                <View style={{flex:1, flexDirection:'row', justifyContent:'space-between'}}>
                                  <View style={{flex:2, justifyContent:'flex-start'}}>
                                    <ListItem button onPress={() => this.BorrarProducto(item,index)}>
                                      <Icon ios='ios-trash' android="md-trash" style={{color: '#d9534f', fontSize: 20}}></Icon>
                                      <Text style={styles.productosList}>{item.nombre_comercial}</Text>
                                    </ListItem>
                                  </View>
                                  <View style={{flex:1, justifyContent:'center'}}>
                                    <NumericInput borderColor={'rgba(255,255,255,0)'} textColor={COLOR.azul} iconStyle={{color:'white'}} rightButtonBackgroundColor={COLOR.azul} leftButtonBackgroundColor={COLOR.azul} rounded minValue={1} maxValue={999} initValue={item.cant} value={item.cant} onChange={value => this.ModificarProducto(item,value,index)}/>
                                  </View>
                                </View>
                              }>
                            </List>
                          </View>
                        }>
                      </FlatList>
                      <Text style={styles.textDocumento}>Agregar Laboratorio: </Text>
                      <Autocomplete
                        autoCapitalize="none"
                        data={labs}
                        defaultValue={query3}
                        onChangeText={text => this.BuscarLaboratorio(text)}
                        placeholder="Laboratorio a buscar"
                        inputContainerStyle={styles.autocompletar}
                        listStyle={styles.autocompletarLista}
                        renderItem={item => (
                          <TouchableOpacity onPress={() => {var array = [...this.state.PRODUCTS2]; var array2 = [...this.state.productos2]; array.push({dk:item.dk, nombre:item.nombre,prods:[],nuevo:true,entrepa:0,estantes:0}); array2.push({index: array2.length,prods:[]}); this.setState({ query3: '', laboratorios:[], PRODUCTS2:array, LABORATORIES:array,productos2:array2 })} }>
                            <Text style={styles.producto}><Icon ios='ios-add-circle-outline' android="md-add-circle-outline" style={{color: COLOR.verde, fontSize: 20}}></Icon> {item.nombre}</Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'libros_faltantes' ?
                    <View>
                      <Text style={styles.textInfo}>Verificar libros faltantes a la fecha: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Al día'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <Text style={styles.textDocumento}>Productos a vencer: </Text>
                      <Autocomplete
                        autoCapitalize="none"
                        data={prods}
                        defaultValue={query}
                        onChangeText={text => this.BuscarProducto(text,'',0)}
                        placeholder="Producto a buscar"
                        inputContainerStyle={styles.autocompletar}
                        listStyle={styles.autocompletarLista}
                        renderItem={item => (
                          <TouchableOpacity onPress={() => this.setState({ query: '', PRODUCTS: [...this.state.PRODUCTS, {nombre_comercial:item.nombre_comercial,cant:1,codigo:item.codigo,laboratorio_id:item.laboratorio_id}] }) }>
                            <Text style={styles.producto}>{item.nombre_comercial}</Text>
                          </TouchableOpacity>
                        )}
                      />
                      <List dataArray={this.state.PRODUCTS}
                        renderRow={(item) =>
                          <View style={{flex:1, flexDirection:'row', justifyContent:'space-between'}}>
                            <View style={{flex:2, justifyContent:'flex-start'}}>
                              <ListItem button onPress={() => this.BorrarProducto(item)}>
                                <Icon ios='ios-trash' android="md-trash" style={{color: '#d9534f', fontSize: 20}}></Icon>
                                <Text style={styles.productosList}>{item.nombre_comercial}</Text>
                              </ListItem>
                            </View>
                            <View style={{flex:1, justifyContent:'center'}}>
                              <NumericInput borderColor={'rgba(255,255,255,0)'} textColor={COLOR.azul} iconStyle={{color:'white'}} rightButtonBackgroundColor={COLOR.azul} leftButtonBackgroundColor={COLOR.azul} rounded minValue={1} maxValue={999} initValue={item.cant} value={item.cant} onChange={value => this.ModificarProducto(item,value)}/>
                            </View>
                          </View>
                        }>
                      </List>                  
                      <Input style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Número Consecutivo" defaultValue={this.state.numero_consecutivo} onChangeText={text => this.setState({numero_consecutivo: text})}></Input>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'actividades_ptc' ?
                    <View>
                      <Text style={[styles.textDocumento,{marginTop:5,marginBottom:5}]}>{items.descripcion_ptc}</Text>
                      {this.state.ptc.map((data,index) => {
                        return(
                          data.tipo === 1 ?
                            <View key={index}>
                              <Text style={styles.textInfo}>{data.titulo}: </Text>
                              <RadioButton SetChecked={this.SetChecked} i={5+index} value={'Si '} checked={data.respuesta === ''? 5+index : data.respuesta+index}></RadioButton>
                              <RadioButton SetChecked={this.SetChecked} i={1+index} value={'No '} checked={data.respuesta === ''? 5+index : data.respuesta+index}></RadioButton>
                            </View>
                          : 
                            data.tipo === 2 ?
                              <View key={index}>
                                <Text style={styles.textInfo}>{data.titulo}: </Text>
                                <Input style={styles.input} placeholderTextColor={COLOR.gris} placeholderTextColor={COLOR.gris} placeholder={data.titulo} defaultValue={data.respuesta} onChangeText={text => {let array = this.state.ptc; array[index].respuesta = text; this.setState({ptc: array})} }></Input>
                              </View>
                            : 
                              data.tipo === 3 ?
                                <View key={index}>
                                  <Text style={styles.textInfo}>{data.titulo}: </Text>
                                  <Form>
                                    <Textarea bordered placeholder={data.titulo} defaultValue={data.respuesta} style={[styles.observaciones,{marginTop:0}]} onChangeText={(text) => {let array = this.state.ptc; array[index].respuesta = text; this.setState({ptc: array})} } />
                                  </Form>
                                </View>
                              : 
                                data.tipo === 4 ?
                                  <View key={index}>
                                    <Text style={styles.textInfo}>{data.titulo}: </Text>
                                    <Autocomplete
                                      autoCapitalize="none"
                                      data={prods}
                                      defaultValue={query}
                                      onChangeText={text => this.BuscarProducto(text,'',0)}
                                      placeholder="Producto a buscar"
                                      inputContainerStyle={styles.autocompletar}
                                      listStyle={styles.autocompletarLista}
                                      renderItem={item => (
                                        <TouchableOpacity onPress={() => {this.setState({ query: '', PRODUCTS: [...this.state.PRODUCTS, {nombre_comercial:item.nombre_comercial,cant:1,codigo:item.codigo,laboratorio_id:item.laboratorio_id}] }, () => {this.updatePTC(index,1);}); } }>
                                          <Text style={styles.producto}>{item.nombre_comercial}</Text>
                                        </TouchableOpacity>
                                      )}
                                    />
                                    <List dataArray={!this.state.updated ? (this.state.PRODUCTS.length > 0 ? this.state.PRODUCTS : this.state.PRODUCTS = data.respuesta) : this.state.PRODUCTS}
                                      renderRow={(item) =>
                                        <View style={{flex:1, flexDirection:'row', justifyContent:'space-between'}}>
                                          <View style={{flex:2, justifyContent:'flex-start'}}>
                                            <ListItem button onPress={() => {var array = [...this.state.PRODUCTS]; var ind = array.indexOf(item); array.splice(ind,1); this.setState({PRODUCTS: array, updated:true}, () => {this.forceUpdate(); this.updatePTC(index,1);})}}>
                                              <Icon ios='ios-trash' android="md-trash" style={{color: '#d9534f', fontSize: 20}}></Icon>
                                              <Text style={styles.productosList}>{item.nombre_comercial}</Text>
                                            </ListItem>
                                          </View>
                                          <View style={{flex:1, justifyContent:'center'}}>
                                            <NumericInput borderColor={'rgba(255,255,255,0)'} textColor={COLOR.azul} iconStyle={{color:'white'}} rightButtonBackgroundColor={COLOR.azul} leftButtonBackgroundColor={COLOR.azul} rounded minValue={-999} maxValue={999} initValue={item.cant} value={item.cant} onChange={value => {var array = [...this.state.PRODUCTS]; var ind = array.indexOf(item); array[ind] = {...array[ind], cant: value}; this.setState({PRODUCTS: array}, () => {this.forceUpdate(); this.updatePTC(index,1);})} }/>
                                          </View>
                                        </View>
                                      }>
                                    </List>
                                  </View>
                                :  
                                  data.tipo === 5 ?                                  
                                    <View key={index}>
                                      <Text style={styles.textInfo}>{data.titulo}: </Text>
                                      <Autocomplete
                                        autoCapitalize="none"
                                        data={labs}
                                        defaultValue={query}
                                        onChangeText={text => this.BuscarLaboratorio(text)}
                                        placeholder="Producto a buscar"
                                        inputContainerStyle={styles.autocompletar}
                                        listStyle={styles.autocompletarLista}
                                        renderItem={item => (
                                          <TouchableOpacity onPress={() => {this.setState({ query: '', laboratorios:[], PRODUCTS2: [...this.state.PRODUCTS2, {dk:item.dk, nombre:item.nombre,prods:[]}] }, () => {this.updatePTC(index,2);}); } }>
                                            <Text style={styles.producto}>{item.nombre}</Text>
                                          </TouchableOpacity>
                                        )}
                                      />
                                      <List dataArray={!this.state.updated ? (this.state.PRODUCTS2.length > 0 ? this.state.PRODUCTS2 : this.state.PRODUCTS2 = data.respuesta) : this.state.PRODUCTS2}
                                        renderRow={(item) =>
                                          <View style={{flex:1, flexDirection:'row', justifyContent:'space-between'}}>
                                            <View style={{flex:2, justifyContent:'flex-start'}}>
                                              <ListItem button onPress={() => {var array = [...this.state.PRODUCTS2]; var ind = array.indexOf(item); array.splice(ind,1); this.setState({PRODUCTS2: array, updated:true}, () => {this.forceUpdate(); this.updatePTC(index,2);})}}>
                                                <Icon ios='ios-trash' android="md-trash" style={{color: '#d9534f', fontSize: 20}}></Icon>
                                                <Text style={styles.productosList}>{item.nombre}</Text>
                                              </ListItem>
                                            </View>
                                          </View>
                                        }>
                                      </List>
                                    </View>
                                  :  
                                    data.tipo === 6 ?
                                      <View key={index}>
                                        <Text style={styles.textInfo}>{data.titulo}: </Text>
                                        <ListItem thumbnail style={{marginLeft:0}}>
                                          <Left>
                                            <TouchableOpacity onPress={() => this.verImagen(true, index)}>
                                              <Image ref={component => this._imgs[index] = component} style={{width: 50, height: 50}} source={{uri: this.state.ptc[index].respuesta !== '' ? (this.state.ptc[index].respuesta.length > 500 ? 'data:image/png;base64,' + this.state.ptc[index].respuesta : api.ipImg + this.state.ptc[index].respuesta ) : Imagen.noDisponible}}></Image>
                                            </TouchableOpacity>
                                          </Left>
                                          <Body style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                                            <Button iconLeft regular block info style={[styles.boton, styles.actualizar,{marginLeft:10,marginRight:10,marginBottom:0}]} onPress={() => this.openFilePicker(true,index)}><Image style={styles.iconoBoton} source={Imagen.find}></Image><Text>Cargar</Text></Button>
                                          </Body>
                                          <Right style={{borderBottomColor: 'rgba(255,255,255,0)',paddingRight:0}}>
                                            <Button regular block info style={[styles.boton, styles.actualizar,{marginLeft:0,marginRight:0,marginBottom:0}]} onPress={() => this.setState({isVisibleCam:true,takePicture:{vencido:true,index:index}})}><Icon style={styles.iconoBoton} ios="ios-camera" android="md-camera"></Icon></Button>
                                          </Right>
                                        </ListItem>
                                      </View>
                                    : null
                        )
                      })}
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'arqueo_caja' ?
                    <View>
                      <Text style={styles.textInfo}>Arqueo de caja:</Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Base: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Base" defaultValue={this.NumberFormat(this.state.base)} onChangeText={text => {var txt = text.replace(/[.%-]/g,''); var value = (txt-this.state.gastos-this.state.diferencia); this.setState({base: txt, sobrante: value > 0 ? 0 : Math.abs(value), faltante: value > 0 ? value : 0 })} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Gastos: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Gastos" defaultValue={this.NumberFormat(this.state.gastos)} onChangeText={text => {var txt = text.replace(/[.%-]/g,''); var value = (this.state.base-txt-this.state.diferencia); this.setState({gastos: txt, sobrante: value > 0 ? 0 : Math.abs(value), faltante: value > 0 ? value : 0 })} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Saldo en efectivo: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Saldo en efectivo" defaultValue={this.NumberFormat(this.state.diferencia)} onChangeText={text => {var txt = text.replace(/[.%-]/g,''); var value = (this.state.base-this.state.gastos-txt); this.setState({diferencia: txt, sobrante: value > 0 ? 0 : Math.abs(value), faltante: value > 0 ? value : 0 })} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Sobrante: {this.NumberFormat(this.state.sobrante)}</Text>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Faltante: {this.NumberFormat(this.state.faltante)}</Text>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'compromisos' ?
                    <View>
                      <Text style={styles.textInfo}>Compromisos de la sucursal:</Text>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Compromiso: </Text>
                      <Input style={[styles.input,{height:60}]} multiline={true} placeholderTextColor={COLOR.gris} placeholder="Compromisos" defaultValue={this.state.compromiso} onChangeText={text => {this.setState({compromiso: text})} }></Input>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'evolucion_clientes' ?
                    <View>
                      <Text style={styles.textInfo}>Captación de clientes: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Año {new Date().getFullYear()-1}: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Cantidad de Clientes" defaultValue={this.NumberFormat(this.state.ano_anterior)} onChangeText={text => this.setState({ano_anterior: text.replace(/[.%-]/g,'')})}></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Año {new Date().getFullYear()}: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Cantidad de Clientes" defaultValue={this.NumberFormat(this.state.ano_actual)} onChangeText={text => this.setState({ano_actual: text.replace(/[.%-]/g,'')})}></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Estrategias a implementar para aumentar clientes: </Text>
                      <Input style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Estrategias" defaultValue={this.state.estrategia} onChangeText={text => this.setState({estrategia: text})}></Input>
                    </View>
                  :
                    null
                }              
                {
                  items.nombre_tabla === 'documentacion_legal' ?
                    <View>
                      <Text style={styles.textInfo}>Verificar Documentación legal: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pendiente'} checked={this.state.checked}></RadioButton>

                        <Picker
                          textStyle={styles.picker}
                          mode="dropdown"
                          iosIcon={<Icon name="arrow-down" />}
                          placeholder="Selecciona una opción"
                          selectedValue={this.state.selected}
                          style={{ width: undefined,marginLeft:15, marginRight:15 }}
                          itemStyle={styles.picker}
                          itemTextStyle={{textTransform:'lowercase'}}
                          onValueChange={value => this.setState({selected:value})}
                        >                      
                          {this.state.lista}
                        </Picker>
                        <Button iconLeft regular block info style={[styles.boton, styles.actualizar]} onPress={() => this.AccederDocumento() }><Image style={styles.iconoBoton} source={Imagen.find}></Image><Text style={styles.textButton}>Modificar Datos</Text></Button>                    
                    </View>
                  :
                    null
                }              
                {
                  items.nombre_tabla === 'programa_mercadeo' ?
                    <View>
                      <Text style={styles.textInfo}>El personal connoce los programas de mercadeo: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pendiente'} checked={this.state.checked}></RadioButton>

                      <Text style={styles.textInfo}>Promociones en separata: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Si  '} checked={parseInt(this.state.mercadeo.promociones_separata)}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'No  '} checked={parseInt(this.state.mercadeo.promociones_separata)}></RadioButton>
                      <Text style={styles.textInfo}>Descuento escalonados: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Si   '} checked={parseInt(this.state.mercadeo.desc_escalonados)}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'No   '} checked={parseInt(this.state.mercadeo.desc_escalonados)}></RadioButton>
                      <Text style={styles.textInfo}>Tienda Virtual: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Si    '} checked={parseInt(this.state.mercadeo.tienda_virtual)}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'No    '} checked={parseInt(this.state.mercadeo.tienda_virtual)}></RadioButton>
                      <Text style={styles.textInfo}>Puntos saludables: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Si     '} checked={parseInt(this.state.mercadeo.puntos_saludables)}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'No     '} checked={parseInt(this.state.mercadeo.puntos_saludables)}></RadioButton>
                      <Text style={styles.textInfo}>Close up: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Si      '} checked={parseInt(this.state.mercadeo.close_up)}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'No      '} checked={parseInt(this.state.mercadeo.close_up)}></RadioButton>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'envio_correspondencia' ?
                    <View>
                      <Text style={styles.textInfo}>Envio de correspondencia a oficina: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Corespondencia: </Text>
                      <Input style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Correspondencia" defaultValue={this.state.correspondencia} onChangeText={text => {this.setState({correspondencia:text })} }></Input>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'servicio_bodega' ?
                    <View>
                      <Text style={styles.textInfo}>Se consulto y transfirio de otros PDV los FALTANTES relacionados en la libreta? </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Si       '} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'No       '} checked={this.state.checked}></RadioButton>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Valor Pedido: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Valor" defaultValue={''+this.NumberFormat(this.state.bodega.valor_pedido)} onChangeText={text => {var data = this.state.bodega; data.valor_pedido = text.replace(/[.%-]/g,''); data.diferencia = text.replace(/[.%-]/g,'')-data.valor_despacho; this.setState({bodega:data })} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Valor Despacho: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="valor" defaultValue={''+this.NumberFormat(this.state.bodega.valor_despacho)} onChangeText={text => {var data = this.state.bodega; data.valor_despacho = text.replace(/[.%-]/g,''); data.diferencia = data.valor_pedido-text.replace(/[.%-]/g,''); this.setState({bodega:data })} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Diferencia: {this.NumberFormat(this.state.bodega.diferencia)}</Text>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Nivel Servicio: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Valor" defaultValue={''+this.NumberFormat(this.state.bodega.nivel_servicio)} onChangeText={text => {var data = this.state.bodega; data.nivel_servicio = text.replace(/[.%-]/g,''); this.setState({bodega:data })} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>El adm. del PDV Revisa los pedidos antes de enviarlo: </Text>
                      <Input style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Respuesta" defaultValue={''+this.state.bodega.revisa_pedidos_antes_enviarlos} onChangeText={text => {var data = this.state.bodega; data.revisa_pedidos_antes_enviarlos = text; this.setState({bodega:data })} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Utiliza libreta de FALTANTES: </Text>
                      <Input style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Respuesta" defaultValue={''+this.state.bodega.utiliza_libreta_faltantes} onChangeText={text => {var data = this.state.bodega; data.utiliza_libreta_faltantes = text; this.setState({bodega:data })} }></Input>
                    </View>
                  :
                    null
                }              
                {
                  items.nombre_tabla === 'libro_vencimientos' ?
                    <View>
                      <Text style={styles.textInfo}>Confirmar que estén separados los productos del libro de vencimientos: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <Text style={styles.textInfo}>Productos a vencer: </Text>
                      <Autocomplete
                        autoCapitalize="none"
                        data={prods}
                        defaultValue={query}
                        onChangeText={text => this.BuscarProducto(text,'',0)}
                        placeholder="Producto a buscar"
                        inputContainerStyle={styles.autocompletar}
                        listStyle={styles.autocompletarLista}
                        renderItem={item => (
                          <TouchableOpacity onPress={() => this.setState({ query: '', PRODUCTS: [...this.state.PRODUCTS, {nombre_comercial:item.nombre_comercial,cant:1,fecha_vencimiento:new Date(),codigo:item.codigo,laboratorio_id:item.laboratorio_id}] }) }>
                            <Text style={styles.producto}>{item.nombre_comercial}</Text>
                          </TouchableOpacity>
                        )}
                      />
                      <List dataArray={this.state.PRODUCTS}
                        renderRow={(item) =>
                          <View>
                            <View style={{flex:1, flexDirection:'row', justifyContent:'space-between'}}>
                              <View style={{flex:2, justifyContent:'flex-start'}}>
                                <ListItem button onPress={() => this.BorrarProducto(item)} style={{borderBottomWidth:0}}>
                                  <Icon ios='ios-trash' android="md-trash" style={{color: '#d9534f', fontSize: 20}}></Icon>
                                  <Text style={[styles.textInfo,{margin:0,marginLeft:3}]}>{item.nombre_comercial}</Text>
                                </ListItem>
                              </View>
                              <View style={{flex:1, justifyContent:'center'}}>
                                <NumericInput borderColor={'rgba(255,255,255,0)'} textColor={COLOR.azul} iconStyle={{color:'white'}} rightButtonBackgroundColor={COLOR.azul} leftButtonBackgroundColor={COLOR.azul} rounded minValue={1} maxValue={999} initValue={item.cant} value={item.cant} onChange={value => this.ModificarProducto(item,value)}/>
                              </View>
                            </View>
                            <View style={{flex:1, flexDirection:'row', justifyContent:'space-between', borderBottomWidth:1}}>
                              <View style={{flex:5, justifyContent:'flex-start'}}>
                                <Text style={[styles.textInfo,{margin:0,marginLeft: 17}]}>Fecha de Vencimiento: </Text>
                              </View>
                              <View style={{flex:4, justifyContent:'center',alignItems:'center', marginTop:-10}}>
                                <DatePicker
                                  defaultDate={new Date(item.fecha_vencimiento)}
                                  minimumDate={new Date(2011, 0, 1)}
                                  locale={"es"}
                                  timeZoneOffsetInMinutes={undefined}
                                  modalTransparent={false}
                                  animationType={"fade"}
                                  androidMode={"default"}
                                  placeHolderText={new Date(item.fecha_vencimiento).toJSON().substr(0,10) === new Date().toJSON().substr(0,10) ? "Seleccionar Fecha" : undefined}
                                  textStyle={{ color: "green" }}
                                  placeHolderTextStyle={{ color: "#d3d3d3" }}
                                  onDateChange={newDate => this.setDate(newDate,item)}
                                  disabled={false}
                                />
                              </View>
                            </View>
                          </View>
                        }>
                      </List>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'facturacion' ?
                    <View>
                      <Text style={styles.textInfo}>Verificar la papelería: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Fecha Resolución: </Text>
                      <DatePicker
                          defaultDate={items.fecha_resolucion !== null? new Date(items.fecha_resolucion) : this.state.fecha_resolucion}
                          minimumDate={new Date(2011, 0, 1)}
                          locale={"es"}
                          timeZoneOffsetInMinutes={undefined}
                          modalTransparent={false}
                          animationType={"fade"}
                          androidMode={"default"}
                          placeHolderText={items.fecha_resolucion === null? "Seleccionar Fecha" : undefined }
                          textStyle={{ color: "green",paddingLeft:20 }}
                          placeHolderTextStyle={{ color: "#d3d3d3",paddingLeft:20 }}
                          onDateChange={newDate => this.setState({fecha_resolucion: newDate})}
                          disabled={false}
                      />
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Número de facturas autorizadas: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="# de facturas" defaultValue={this.state.facturas_autorizadas} onChangeText={text => this.setState({facturas_autorizadas: text})}></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Fecha de la última factura: </Text>
                      <DatePicker
                          defaultDate={items.fecha_ultima_factura !== null? new Date(items.fecha_ultima_factura) : this.state.fecha_ultima_factura}
                          minimumDate={new Date(2011, 0, 1)}
                          locale={"es"}
                          timeZoneOffsetInMinutes={undefined}
                          modalTransparent={false}
                          animationType={"fade"}
                          androidMode={"default"}
                          placeHolderText={items.fecha_ultima_factura === null? "Seleccionar Fecha" : undefined }
                          textStyle={{ color: "green",paddingLeft:20 }}
                          placeHolderTextStyle={{ color: "#d3d3d3",paddingLeft:20 }}
                          onDateChange={newDate => this.setState({fecha_ultima_factura: newDate})}
                          disabled={false}
                      />
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Número de la última factura: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="# de factura" defaultValue={this.state.numero_ultima_factura} onChangeText={text => this.setState({numero_ultima_factura: text})}></Input>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'domicilios' ?
                    <View>
                      <Text style={styles.textInfo}>Revisar domicilios: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Ventas Mes anterior: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Valor" defaultValue={this.NumberFormat(this.state.domicilios.mes_anterior)} onChangeText={text => {var dom = this.state.domicilios; dom.mes_anterior = text.replace(/[.%-]/g,''); var value = Math.floor(dom.mes_actual/dom.dia_actual*(30-dom.dia_actual)+parseInt(dom.mes_actual)); dom.venta_proyeccion = value; var prom = (dom.mes_actual/dom.num_mensajeros); dom.prom_domicilio_mensajero = prom; this.setState({domicilios:dom })} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Ventas Mes actual: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="valor" defaultValue={this.NumberFormat(this.state.domicilios.mes_actual)} onChangeText={text => {var dom = this.state.domicilios; dom.mes_actual = text.replace(/[.%-]/g,''); var value = Math.floor(text.replace(/[.%-]/g,'')/dom.dia_actual*(30-dom.dia_actual)+parseInt(text.replace(/[.%-]/g,''))); dom.venta_proyeccion = value; var prom = (dom.mes_actual/dom.num_mensajeros); dom.prom_domicilio_mensajero = prom; this.setState({domicilios:dom })} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Días transcurridos: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Día actual" defaultValue={this.state.domicilios.dia_actual} onChangeText={text => {var dom = this.state.domicilios; dom.dia_actual = text; var value = Math.floor(dom.mes_actual/dom.dia_actual*(30-text)+parseInt(dom.mes_actual)); dom.venta_proyeccion = value; this.setState({domicilios:dom })} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Venta Domicilios Proyección: {this.NumberFormat(this.state.domicilios.venta_proyeccion)}</Text>
                      
                      <Text style={[styles.textDocumento,{marginLeft:20}]}># mensajeros de planta: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Valor" defaultValue={this.state.domicilios.num_mensajeros} onChangeText={text => {var dom = this.state.domicilios; dom.num_mensajeros = text; var value = (dom.mes_actual/dom.dia_actual*(30-dom.dia_actual)+parseInt(dom.mes_actual)); dom.venta_proyeccion = value; var prom = (dom.mes_actual/text); dom.prom_domicilio_mensajero = prom; this.setState({domicilios:dom })} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Promedio Domicilio/Mensajero: {this.NumberFormat(this.state.domicilios.prom_domicilio_mensajero)}</Text>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'remisiones' ?
                    <View>
                      <Text style={styles.textInfo}>Revisar remisiones grabadas a la fecha: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Consecutivos: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Valor" defaultValue={''+this.state.remisiones.consecutivos} onChangeText={text => {var rem = this.state.remisiones; rem.consecutivos = text; this.setState({remisiones:rem })} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Número de remisiones: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="valor" defaultValue={''+this.state.remisiones.numero_remisiones} onChangeText={text => {var rem = this.state.remisiones; rem.numero_remisiones = text; this.setState({remisiones:rem })} }></Input>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'inventario_mercancia' ?
                    <View>
                      <Text style={styles.textInfo}>Revision completa de los inventarios: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Valor Actual: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Valor" defaultValue={''+this.NumberFormat(this.state.mercancia.valor_actual)} onChangeText={text => {var data = this.state.mercancia; data.valor_actual = text.replace(/[.%-]/g,''); this.setState({mercancia:data })} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Días Inventario: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="valor" defaultValue={''+this.state.mercancia.dias_inventario} onChangeText={text => {var data = this.state.mercancia; data.dias_inventario = text; this.setState({mercancia:data })} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Inventario Optimo: </Text>
                      <Input style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Respuesta" defaultValue={''+this.state.mercancia.inv_optimo} onChangeText={text => {var data = this.state.mercancia; data.inv_optimo = text; this.setState({mercancia:data })} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Valor dev. Cierre de Mes: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Valor" defaultValue={''+this.NumberFormat(this.state.mercancia.valor_dev_cierre_mes)} onChangeText={text => {var data = this.state.mercancia; data.valor_dev_cierre_mes = text.replace(/[.%-]/g,''); this.setState({mercancia:data })} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Dev. vencimiento M. estado: </Text>
                      <Input style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Respuesta" defaultValue={''+this.state.mercancia.dev_vencimiento_m_estado} onChangeText={text => {var data = this.state.mercancia; data.dev_vencimiento_m_estado = text; this.setState({mercancia:data })} }></Input>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'gimed' ?
                    <View>
                      <Text style={styles.textInfo}>Revisión Gimed: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Productos Cero (0) en el inventario: </Text>
                      <Autocomplete
                        autoCapitalize="none"
                        data={prods}
                        defaultValue={query}
                        onChangeText={text => this.BuscarProducto(text,'4301',0)}//4301 - dk GIMED
                        placeholder="Producto a buscar"
                        inputContainerStyle={styles.autocompletar}
                        listStyle={styles.autocompletarLista}
                        renderItem={item => (
                          <TouchableOpacity onPress={() => {this.setState({ query: '', PRODUCTS: [...this.state.PRODUCTS, {nombre_comercial:item.nombre_comercial,cant:1,codigo:item.codigo,laboratorio_id:item.laboratorio_id}] })} }>
                            <Text style={styles.producto}>{item.nombre_comercial}</Text>
                          </TouchableOpacity>
                        )}
                      />
                      <List dataArray={this.state.PRODUCTS}
                        renderRow={(item) =>
                          <View style={{flex:1, flexDirection:'row', justifyContent:'space-between'}}>
                            <View style={{flex:1, justifyContent:'flex-start'}}>
                              <ListItem button onPress={() => {var array = [...this.state.PRODUCTS]; var ind = array.indexOf(item); array.splice(ind,1); this.setState({PRODUCTS: array, updated:true}, () => {this.forceUpdate();})}}>
                                <Icon ios='ios-trash' android="md-trash" style={{color: '#d9534f', fontSize: 20}}></Icon>
                                <Text style={styles.productosList}>{item.nombre_comercial}</Text>
                              </ListItem>
                            </View>
                          </View>
                        }>
                      </List>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Productos Cero (0) rotación últimos 90 días: </Text>
                      <Autocomplete
                        autoCapitalize="none"
                        data={prods2}
                        defaultValue={query3}
                        onChangeText={text => this.BuscarProducto(text,'4301',-1)}//4301 - dk GIMED
                        placeholder="Producto a buscar"
                        inputContainerStyle={styles.autocompletar}
                        listStyle={styles.autocompletarLista}
                        renderItem={item => (
                          <TouchableOpacity onPress={() => {this.setState({ query3: '', PRODUCTS2: [...this.state.PRODUCTS2, {nombre_comercial:item.nombre_comercial,cant:1,codigo:item.codigo,laboratorio_id:item.laboratorio_id}] })} }>
                            <Text style={styles.producto}>{item.nombre_comercial}</Text>
                          </TouchableOpacity>
                        )}
                      />
                      <List dataArray={this.state.PRODUCTS2}
                        renderRow={(item) =>
                          <View style={{flex:1, flexDirection:'row', justifyContent:'space-between'}}>
                            <View style={{flex:1, justifyContent:'flex-start'}}>
                              <ListItem button onPress={() => {var array = [...this.state.PRODUCTS2]; var ind = array.indexOf(item); array.splice(ind,1); this.setState({PRODUCTS2: array, updated:true}, () => {this.forceUpdate();})}}>
                                <Icon ios='ios-trash' android="md-trash" style={{color: '#d9534f', fontSize: 20}}></Icon>
                                <Text style={styles.productosList}>{item.nombre_comercial}</Text>
                              </ListItem>
                            </View>
                          </View>
                        }>
                      </List>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Acciones tomadas: </Text>
                      <Input style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Respuesta" defaultValue={''+this.state.acciones_tomadas?this.state.acciones_tomadas:''} onChangeText={text => {this.setState({acciones_tomadas:text })} }></Input>
                    </View>
                  :
                    null
                }                
                {
                  items.nombre_tabla === 'examen_gimed' ?
                    <View>
                      <Text style={styles.textInfo}>Revisión del desempeño de cada vendedor: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <Picker
                        textStyle={styles.picker}
                        mode="dropdown"
                        iosIcon={<Icon name="arrow-down" />}
                        placeholder="Selecciona una opción"
                        selectedValue={this.state.selected}
                        style={{ width: undefined,marginLeft:15, marginRight:15}}
                        itemStyle={styles.picker}
                        itemTextStyle={{textTransform:'lowercase'}}
                        onValueChange={value => this.setState({selected:value})}
                      >                      
                        {this.state.lista}
                      </Picker>
                      <Button iconLeft regular block info style={[styles.boton, styles.actualizar]} onPress={() => {var products = this.state.examen[this.state.selected].productos_consultados?this.state.examen[this.state.selected].productos_consultados:[]; var res = this.state.examen[this.state.selected].resultados?this.state.examen[this.state.selected].resultados : 5;  this.setState({PRODUCTS:products,checked2:res, isVisibleActividad3:true});} }><Image style={styles.iconoBoton} source={Imagen.find}></Image><Text style={styles.textButton}>Modificar Datos</Text></Button>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'julienne' ?
                    <View>
                      <Text style={styles.textInfo}>Revisión de las ventas de Julienne: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Ventas Mes anterior: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Valor" defaultValue={''+this.NumberFormat(this.state.julienne.mes_anterior)} onChangeText={text => {var dom = this.state.julienne; dom.mes_anterior = text.replace(/[.%-]/g,''); var value = Math.floor(dom.mes_actual/dom.dia_actual*(30-dom.dia_actual)+parseInt(dom.mes_actual)); dom.venta_proyeccion = value; this.setState({julienne:dom })} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Ventas Mes actual: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="valor" defaultValue={''+this.NumberFormat(this.state.julienne.mes_actual)} onChangeText={text => {console.log(this.state.julienne); var dom = this.state.julienne; dom.mes_actual = text.replace(/[.%-]/g,''); var value = Math.floor(text.replace(/[.%-]/g,'')/dom.dia_actual*(30-dom.dia_actual)+parseInt(text.replace(/[.%-]/g,''))); dom.venta_proyeccion = value; this.setState({julienne:dom })} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Días transcurridos: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Día actual" defaultValue={''+this.state.julienne.dia_actual} onChangeText={text => {var dom = this.state.julienne; dom.dia_actual = text; var value = Math.floor(dom.mes_actual/dom.dia_actual*(30-text)+parseInt(dom.mes_actual)); dom.venta_proyeccion = value; this.setState({julienne:dom })} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Proyección de ventas: {this.NumberFormat(this.state.julienne.venta_proyeccion)}</Text>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Productos faltantes: </Text>
                      <Autocomplete
                        autoCapitalize="none"
                        data={prods}
                        defaultValue={query}
                        onChangeText={text => this.BuscarProducto(text,'',0)}
                        placeholder="Producto a buscar"
                        inputContainerStyle={styles.autocompletar}
                        listStyle={styles.autocompletarLista}
                        renderItem={item => (
                          <TouchableOpacity onPress={() => {this.setState({ query: '', PRODUCTS: [...this.state.PRODUCTS, {nombre_comercial:item.nombre_comercial,cant:1,codigo:item.codigo,laboratorio_id:item.laboratorio_id}] })} }>
                            <Text style={styles.producto}>{item.nombre_comercial}</Text>
                          </TouchableOpacity>
                        )}
                      />
                      <List dataArray={this.state.PRODUCTS}
                        renderRow={(item) =>
                          <View style={{flex:1, flexDirection:'row', justifyContent:'space-between'}}>
                            <View style={{flex:2, justifyContent:'flex-start'}}>
                              <ListItem button onPress={() => {var array = [...this.state.PRODUCTS]; var ind = array.indexOf(item); array.splice(ind,1); this.setState({PRODUCTS: array, updated:true}, () => {this.forceUpdate();})}}>
                                <Icon ios='ios-trash' android="md-trash" style={{color: '#d9534f', fontSize: 20}}></Icon>
                                <Text style={styles.productosList}>{item.nombre_comercial}</Text>
                              </ListItem>
                            </View>
                            <View style={{flex:1, justifyContent:'center'}}>
                              <NumericInput borderColor={'rgba(255,255,255,0)'} textColor={COLOR.azul} iconStyle={{color:'white'}} rightButtonBackgroundColor={COLOR.azul} leftButtonBackgroundColor={COLOR.azul} rounded minValue={1} maxValue={999} initValue={item.cant} value={item.cant} onChange={value => {var array = [...this.state.PRODUCTS]; var ind = array.indexOf(item); array[ind] = {...array[ind], cant: value}; this.setState({PRODUCTS: array}, () => {this.forceUpdate(); })} }/>
                            </View>
                          </View>
                        }>
                      </List>
                      </View>
                  :
                    null
                }
                {//FIXME: modificar que solo pueda ver los productos bonificados
                  items.nombre_tabla === 'productos_bonificados' ?
                    <View>
                      <Text style={styles.textInfo}>Revisión del desempeño de cada vendedor: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Productos que no rotan en 90 dias: </Text>
                      <Autocomplete
                        autoCapitalize="none"
                        data={prods}
                        defaultValue={query}
                        onChangeText={text => this.BuscarProducto(text,'',0)}
                        placeholder="Producto a buscar"
                        inputContainerStyle={styles.autocompletar}
                        listStyle={styles.autocompletarLista}
                        renderItem={item => (
                          <TouchableOpacity onPress={() => {this.setState({ query: '', PRODUCTS: [...this.state.PRODUCTS, {nombre_comercial:item.nombre_comercial,cant:1,codigo:item.codigo,laboratorio_id:item.laboratorio_id}] })} }>
                            <Text style={styles.producto}>{item.nombre_comercial}</Text>
                          </TouchableOpacity>
                        )}
                      />
                      <List dataArray={this.state.PRODUCTS}
                        renderRow={(item) =>
                          <View style={{flex:1, flexDirection:'row', justifyContent:'space-between'}}>
                            <View style={{flex:1, justifyContent:'flex-start'}}>
                              <ListItem button onPress={() => {var array = [...this.state.PRODUCTS]; var ind = array.indexOf(item); array.splice(ind,1); this.setState({PRODUCTS: array, updated:true}, () => {this.forceUpdate();})}}>
                                <Icon ios='ios-trash' android="md-trash" style={{color: '#d9534f', fontSize: 20}}></Icon>
                                <Text style={styles.productosList}>{item.nombre_comercial}</Text>
                              </ListItem>
                            </View>
                          </View>
                        }>
                      </List>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Productos proximos a vencer: </Text>
                      <Autocomplete
                        autoCapitalize="none"
                        data={prods2}
                        defaultValue={query3}
                        onChangeText={text => this.BuscarProducto(text,'',-1)}
                        placeholder="Producto a buscar"
                        inputContainerStyle={styles.autocompletar}
                        listStyle={styles.autocompletarLista}
                        renderItem={item => (
                          <TouchableOpacity onPress={() => {this.setState({ query3: '', PRODUCTS2: [...this.state.PRODUCTS2, {nombre_comercial:item.nombre_comercial,cant:1,codigo:item.codigo,laboratorio_id:item.laboratorio_id,fecha_vencimiento:new Date()}] })} }>
                            <Text style={styles.producto}>{item.nombre_comercial}</Text>
                          </TouchableOpacity>
                        )}
                      />
                      <List dataArray={this.state.PRODUCTS2}
                        renderRow={(item) =>
                          <View>
                            <View style={{flex:1, flexDirection:'row', justifyContent:'space-between', borderBottomWidth:0}}>
                              <View style={{flex:1, justifyContent:'flex-start', borderBottomWidth:0}}>
                                <ListItem style={{borderBottomWidth:0}} button onPress={() => {var array = [...this.state.PRODUCTS2]; var ind = array.indexOf(item); array.splice(ind,1); this.setState({PRODUCTS2: array, updated:true}, () => {this.forceUpdate();})}}>
                                  <Icon ios='ios-trash' android="md-trash" style={{color: '#d9534f', fontSize: 20}}></Icon>
                                  <Text style={styles.productosList}>{item.nombre_comercial}</Text>
                                </ListItem>
                              </View>                              
                            </View>
                            <View style={{flex:1, flexDirection:'row', justifyContent:'space-between', borderBottomWidth:1}}>
                              <View style={{flex:5, justifyContent:'flex-start'}}>
                                <Text style={[styles.textInfo,{margin:0,marginLeft: 20}]}>Fecha de Vencimiento: </Text>
                              </View>
                              <View style={{flex:4, justifyContent:'flex-start', marginTop:-10}}>
                                <DatePicker
                                  defaultDate={new Date(item.fecha_vencimiento)}
                                  minimumDate={new Date(2011, 0, 1)}
                                  locale={"es"}
                                  timeZoneOffsetInMinutes={undefined}
                                  modalTransparent={false}
                                  animationType={"fade"}
                                  androidMode={"default"}
                                  placeHolderText={new Date(item.fecha_vencimiento).toJSON().substr(0,10) === new Date().toJSON().substr(0,10) ? "Seleccionar Fecha" : undefined}
                                  textStyle={{ color: "green" }}
                                  placeHolderTextStyle={{ color: "#d3d3d3" }}
                                  onDateChange={newDate => {var array = [...this.state.PRODUCTS2]; var index = array.indexOf(item); if (index !== -1){array[index] = {...array[index], fecha_vencimiento: newDate}; this.setState({chosenDate: newDate, PRODUCTS2: array}); this.forceUpdate();}}}
                                  disabled={false}
                              />
                              </View>
                            </View>
                          </View>
                        }>
                      </List>
                    </View>
                  :
                    null
                }
                {//FIXME: cambiar productos a solo institucionales
                  items.nombre_tabla === 'uso_institucional' ?
                    <View>
                      <Text style={styles.textInfo}>Revisión de productos de uso institucional: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Productos de uso institucional: </Text>
                      <Autocomplete
                        autoCapitalize="none"
                        data={prods}
                        defaultValue={query}
                        onChangeText={text => this.BuscarProducto(text,'',0)}
                        placeholder="Producto a buscar"
                        inputContainerStyle={styles.autocompletar}
                        listStyle={styles.autocompletarLista}
                        renderItem={item => (
                          <TouchableOpacity onPress={() => {this.setState({ query: '', PRODUCTS: [...this.state.PRODUCTS, {nombre_comercial:item.nombre_comercial,cant:1,codigo:item.codigo,laboratorio_id:item.laboratorio_id}] })} }>
                            <Text style={styles.producto}>{item.nombre_comercial}</Text>
                          </TouchableOpacity>
                        )}
                      />
                      <List dataArray={this.state.PRODUCTS}
                        renderRow={(item) =>
                          <View style={{flex:1, flexDirection:'row', justifyContent:'space-between'}}>
                            <View style={{flex:2, justifyContent:'flex-start'}}>
                              <ListItem button onPress={() => {var array = [...this.state.PRODUCTS]; var ind = array.indexOf(item); array.splice(ind,1); this.setState({PRODUCTS: array, updated:true}, () => {this.forceUpdate();})}}>
                                <Icon ios='ios-trash' android="md-trash" style={{color: '#d9534f', fontSize: 20}}></Icon>
                                <Text style={styles.productosList}>{item.nombre_comercial}</Text>
                              </ListItem>
                            </View>
                            <View style={{flex:1, justifyContent:'center'}}>
                              <NumericInput borderColor={'rgba(255,255,255,0)'} textColor={COLOR.azul} iconStyle={{color:'white'}} rightButtonBackgroundColor={COLOR.azul} leftButtonBackgroundColor={COLOR.azul} rounded minValue={1} maxValue={999} initValue={item.cant} value={item.cant} onChange={value => {var array = [...this.state.PRODUCTS]; var ind = array.indexOf(item); array[ind] = {...array[ind], cant: value}; this.setState({PRODUCTS: array}, () => {this.forceUpdate(); })} }/>
                            </View>
                          </View>
                        }>
                      </List>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'relacion_servicios_publicos' ?
                    <View>
                      <Text style={styles.textInfo}>Relación del consumo de los últimos 2 meses: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <Text style={styles.textInfo}>Agua: </Text>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Mes Actual: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Valor" defaultValue={''+this.NumberFormat(this.state.servicios_publicos.agua.mes_actual)} onChangeText={text => {var data = this.state.servicios_publicos; data.agua.mes_actual = text.replace(/[.%-]/g,''); this.setState({servicios_publicos:data })} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Mes Anterior: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="valor" defaultValue={''+this.NumberFormat(this.state.servicios_publicos.agua.mes_pasado)} onChangeText={text => {var data = this.state.servicios_publicos; data.agua.mes_pasado = text.replace(/[.%-]/g,''); this.setState({servicios_publicos:data })} }></Input>
                      <Text style={styles.textInfo}>Luz: </Text>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Mes Actual: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Valor" defaultValue={''+this.NumberFormat(this.state.servicios_publicos.luz.mes_actual)} onChangeText={text => {var data = this.state.servicios_publicos; data.luz.mes_actual = text.replace(/[.%-]/g,''); this.setState({servicios_publicos:data })} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Mes Anterior: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="valor" defaultValue={''+this.NumberFormat(this.state.servicios_publicos.luz.mes_pasado)} onChangeText={text => {var data = this.state.servicios_publicos; data.luz.mes_pasado = text.replace(/[.%-]/g,''); this.setState({servicios_publicos:data })} }></Input>
                      <Text style={styles.textInfo}>Telefono: </Text>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Mes Actual: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Valor" defaultValue={''+this.NumberFormat(this.state.servicios_publicos.telefono.mes_actual)} onChangeText={text => {var data = this.state.servicios_publicos; data.telefono.mes_actual = text.replace(/[.%-]/g,''); this.setState({servicios_publicos:data })} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Mes Anterior: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="valor" defaultValue={''+this.NumberFormat(this.state.servicios_publicos.telefono.mes_pasado)} onChangeText={text => {var data = this.state.servicios_publicos; data.telefono.mes_pasado = text.replace(/[.%-]/g,''); this.setState({servicios_publicos:data })} }></Input>
                      <Text style={styles.textInfo}>Internet: </Text>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Mes Actual: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="Valor" defaultValue={''+this.NumberFormat(this.state.servicios_publicos.internet.mes_actual)} onChangeText={text => {var data = this.state.servicios_publicos; data.internet.mes_actual = text.replace(/[.%-]/g,''); this.setState({servicios_publicos:data })} }></Input>
                      <Text style={[styles.textDocumento,{marginLeft:20}]}>Mes Anterior: </Text>
                      <Input keyboardType='numeric' style={styles.input} placeholderTextColor={COLOR.gris} placeholder="valor" defaultValue={''+this.NumberFormat(this.state.servicios_publicos.internet.mes_pasado)} onChangeText={text => {var data = this.state.servicios_publicos; data.internet.mes_pasado = text.replace(/[.%-]/g,''); this.setState({servicios_publicos:data })} }></Input>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'relacion_vendedores' ?
                    <View>
                      <Text style={styles.textInfo}>Revisión del desempeño de cada vendedor: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <Picker
                        textStyle={styles.picker}
                        mode="dropdown"
                        iosIcon={<Icon name="arrow-down" />}
                        placeholder="Selecciona una opción"
                        selectedValue={this.state.selected}
                        style={{ width: undefined,marginLeft:15, marginRight:15}}
                        itemStyle={styles.picker}
                        itemTextStyle={{textTransform:'lowercase'}}
                        onValueChange={value => this.setState({selected:value})}
                      >                      
                        {this.state.lista}
                      </Picker>
                      <Button iconLeft regular block info style={[styles.boton, styles.actualizar]} onPress={() => {this.setState({isVisibleActividad3:true});} }><Image style={styles.iconoBoton} source={Imagen.find}></Image><Text style={styles.textButton}>Modificar Datos</Text></Button>
                      <Text style={[styles.textInfo]}>Aplican el proceso ideal de venta:</Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={' Si   '} checked={this.state.aplica_proceso_ideal_venta}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={' No   '} checked={this.state.aplica_proceso_ideal_venta}></RadioButton>   
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'senalizacion' ?
                    <View>
                      <Text style={styles.textInfo}>Revisión de la señalización: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <Picker
                        textStyle={styles.picker}
                        mode="dropdown"
                        iosIcon={<Icon name="arrow-down" />}
                        placeholder="Selecciona una opción"
                        selectedValue={this.state.selected}
                        style={{ width: undefined,marginLeft:15, marginRight:15}}
                        itemStyle={styles.picker}
                        itemTextStyle={{textTransform:'lowercase'}}
                        onValueChange={value => this.setState({selected:value})}
                      >                      
                        {this.state.lista}
                      </Picker>
                      <Button iconLeft regular block info style={[styles.boton, styles.actualizar]} onPress={() => {this.setState({isVisibleActividad3:true});} }><Image style={styles.iconoBoton} source={Imagen.find}></Image><Text style={styles.textButton}>Modificar Datos</Text></Button>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'solicitud_seguro' ?
                    <View>
                      <Text style={styles.textInfo}>Revisión de la solicitud de seguros PDV: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <Text style={[styles.textDocumento,{marginBottom:8}]}>Foto de la solicitud</Text>
                      <ListItem thumbnail style={{marginLeft:20, marginRight:20}}>
                        <Left>
                          <TouchableOpacity onPress={() => this.verImagen(true,-1)}>
                            <Image ref={component => this._img1 = component} style={{width: 50, height: 50}} source={{uri: items.seguro ? this.state.imgVencido : Imagen.noDisponible}}></Image>
                          </TouchableOpacity>
                        </Left>
                        <Body style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                          <Button iconLeft regular block info style={[styles.boton, styles.actualizar,{marginLeft:10,marginRight:10,marginBottom:0}]} onPress={() => this.openFilePicker(true,-1)}><Image style={styles.iconoBoton} source={Imagen.find}></Image><Text>Cargar</Text></Button>
                        </Body>
                        <Right style={{borderBottomColor: 'rgba(255,255,255,0)',paddingRight:0}}>
                          <Button regular block info style={[styles.boton, styles.actualizar,{marginLeft:0,marginRight:0,marginBottom:0}]} onPress={() => this.setState({isVisibleCam:true,takePicture:{vencido:true,index:-1}})}><Icon style={styles.iconoBoton} ios="ios-camera" android="md-camera"></Icon></Button>
                        </Right>
                      </ListItem>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'contratos_anexos_legalizacion' ?
                    <View>
                      <Text style={styles.textInfo}>Revisión de contratos y anexos para legalización y trámite: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <Text style={[styles.textDocumento,{marginBottom:8}]}>Foto del contrato</Text>
                      <ListItem thumbnail style={{marginLeft:20, marginRight:20}}>
                        <Left>
                          <TouchableOpacity onPress={() => this.verImagen(true,-1)}>
                            <Image ref={component => this._img1 = component} style={{width: 50, height: 50}} source={{uri: items.contrato ? this.state.imgVencido : Imagen.noDisponible}}></Image>
                          </TouchableOpacity>
                        </Left>
                        <Body style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                          <Button iconLeft regular block info style={[styles.boton, styles.actualizar,{marginLeft:10,marginRight:10,marginBottom:0}]} onPress={() => this.openFilePicker(true,-1)}><Image style={styles.iconoBoton} source={Imagen.find}></Image><Text>Cargar</Text></Button>
                        </Body>
                        <Right style={{borderBottomColor: 'rgba(255,255,255,0)',paddingRight:0}}>
                          <Button regular block info style={[styles.boton, styles.actualizar,{marginLeft:0,marginRight:0,marginBottom:0}]} onPress={() => this.setState({isVisibleCam:true,takePicture:{vencido:true,index:-1}})}><Icon style={styles.iconoBoton} ios="ios-camera" android="md-camera"></Icon></Button>
                        </Right>
                      </ListItem>
                    </View>
                  :
                    null
                }
                <Form>
                  {
                    this.state.motivo !== '' ?
                      <View>
                        <Text style={styles.textInfo}>Motivo de ausencia: </Text>
                        <Picker
                          mode="dropdown"
                          iosIcon={<Icon name="arrow-down" />}
                          placeholder="Motivo de ausencia"
                          placeholderStyle={{ color: "#bfc6ea" }}
                          placeholderIconColor="#007aff"
                          style={{ width: undefined,marginLeft:15, marginRight:15, color:COLOR.rojo }}
                          itemStyle={styles.picker}
                          itemTextStyle={styles.picker}
                          selectedValue={this.state.motivo}
                          onValueChange={this.onValueChange.bind(this)}
                        >
                          <Picker.Item label="SINIESTRO" value="0"/>
                          <Picker.Item label="VISITAS DE ENTIDADES PÚBLICAS" value="1" />
                          <Picker.Item label="REQUERIMIENTO GERENCIAL" value="2" />
                          <Picker.Item label="AUSENCIA ADMINISTRADOR" value="3" />
                          <Picker.Item label="TRABAJO ESPECIAL" value="4" />
                        </Picker>
                      </View>
                    :
                      null
                  }
                  <Textarea rowSpan={2} bordered placeholder="Observaciones" defaultValue={items.observacion} style={[styles.observaciones,{height:80}]} onChangeText={(text) => this.setState({observacion: text})} />
                </Form>
              </Card>
              {
                items.estado === 1 ?
                  <Button success regular block style={[styles.boton, styles.finalizar]} onPress={() => Alert.alert('Confirmar','Desea finalizar la actividad?',[{text: 'Cancelar',onPress: () => console.log('Cancel Pressed'),style: 'cancel',},{text: 'OK', onPress: () => { this.FinishActivity(this.props.handler2)}},],{cancelable: false},)}><Text style={styles.textButton}> Finalizar </Text></Button>
                :              
                  <Button info regular block style={[styles.boton, styles.actualizar]} onPress={() => Alert.alert('Confirmar','Desea finalizar la actividad?',[{text: 'Cancelar',onPress: () => console.log('Cancel Pressed'),style: 'cancel',},{text: 'OK', onPress: () => { this.FinishActivity(this.props.handler2)}},],{cancelable: false},)}><Text style={styles.textButton}> Actualizar </Text></Button>
              }
            </Content>
          </KeyboardAvoidingView>

          <Overlay
            visible={this.state.isVisible}
            closeOnTouchOutside 
            animationType="zoomIn"
            onClose={() => this.setState({isVisible: false})}
            containerStyle={{backgroundColor: "rgba(0, 0, 0, .5)", width:"auto",height:"auto"}}
            childrenWrapperStyle={{backgroundColor: "rgba(0, 0, 0, .5)", borderRadius: 10}}
          >
            <Text style={styles.descripcion}>{info}</Text>
          </Overlay>

          {
            items.nombre_tabla === 'documentacion_legal' ?
              <Overlay
                visible={this.state.isVisibleActividad}
                animationType="zoomIn"
                onClose={() => this.setState({isVisibleActividad: false,isLoadActividad:false})}
                containerStyle={{backgroundColor: "rgba(0, 0, 0, .8)", width:"auto",height:"auto"}}
                childrenWrapperStyle={{backgroundColor: "rgba(255, 255, 255, 1)", borderRadius: 10}}
              >
                {
                  /***
                * Mostrar layout luego de cargar los datos
                */
                !this.state.isLoadActividad && this.state.isVisibleActividad?
                  <View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color={COLOR.azul} /></View>
                :
                  <View style={{justifyContent:'space-between', width:"100%"}}>
                    <TouchableOpacity style={{marginBottom:10, width:50}} onPress={() => this.setState({isVisibleActividad: false,isLoadActividad:false})}><Image style={styles.iconoBoton} source={Imagen.back}></Image></TouchableOpacity>
                    <ScrollView>
                      <Text style={[styles.textDocumento,{marginTop:0,marginLeft:0}]}>{this.state.isLoadActividad ? this.state.documentos.documento : ''}</Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Si'} checked={this.state.checked2}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'No'} checked={this.state.checked2}></RadioButton>
                      <Text style={styles.textDescFoto}>Documento Vencido</Text>
                      <ListItem thumbnail style={{marginLeft:0}}>
                        <Left>
                          <TouchableOpacity onPress={() => this.verImagen(true,-1)}>
                            <Image ref={component => this._img1 = component} style={{width: 50, height: 50}} source={{uri: this.state.isLoadActividad ? this.state.imgVencido : Imagen.noDisponible}}></Image>
                          </TouchableOpacity>
                        </Left>
                        <Body style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                          <Button iconLeft regular block info style={[styles.boton, styles.actualizar,{marginLeft:10,marginRight:10,marginBottom:0}]} onPress={() => this.openFilePicker(true,-1)}><Image style={styles.iconoBoton} source={Imagen.find}></Image><Text>Cargar</Text></Button>
                        </Body>
                        <Right style={{borderBottomColor: 'rgba(255,255,255,0)',paddingRight:0}}>
                          <Button regular block info style={[styles.boton, styles.actualizar,{marginLeft:0,marginRight:0,marginBottom:0}]} onPress={() => this.setState({isVisibleCam:true,takePicture:{vencido:true,index:-1}})}><Icon style={styles.iconoBoton} ios="ios-camera" android="md-camera"></Icon></Button>
                        </Right>
                      </ListItem>
                      <Text style={styles.textDescFoto}>Documento Renovado</Text>
                      <ListItem thumbnail style={{marginLeft:0}}>
                        <Left>
                          <TouchableOpacity onPress={() => this.verImagen(false,-1)}>
                            <Image ref={component => this._img2 = component} style={{width: 50, height: 50}} source={{uri: this.state.isLoadActividad ? this.state.imgRenovado : Imagen.noDisponible}}></Image>
                          </TouchableOpacity>
                        </Left>
                        <Body style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                          <Button iconLeft regular block info style={[styles.boton, styles.actualizar,{marginLeft:10,marginRight:10,marginBottom:0}]} onPress={() => this.openFilePicker(false,-1)}><Image style={styles.iconoBoton} source={Imagen.find}></Image><Text>Cargar</Text></Button>
                        </Body>
                        <Right style={{borderBottomColor: 'rgba(255,255,255,0)',paddingRight:0}}>
                          <Button regular block info style={[styles.boton, styles.actualizar,{marginLeft:0,marginRight:0,marginBottom:0}]} onPress={() => this.setState({isVisibleCam:true,takePicture:{vencido:false,index:-1}})}><Icon style={styles.iconoBoton} ios="ios-camera" android="md-camera"></Icon></Button>
                        </Right>
                      </ListItem>
                      <Form>
                        <Textarea bordered placeholder="Observaciones" defaultValue={this.state.isLoadActividad ? this.state.documentos.observaciones : ''} style={[styles.observaciones,{marginTop:0,marginLeft:0,marginRight:0}]} onChangeText={(text) => this.setState({observacion2: text})} />
                      </Form>
                      <Button disabled={this.state.disable} success regular block style={[styles.boton, styles.finalizar, {marginTop:10,marginLeft:20,marginRight:20}]} onPress={() => {this.setState({disable:true}); Keyboard.dismiss; this.UpdateData()}}><Text> Actualizar </Text></Button>
                    </ScrollView>
                  </View>
                }
              </Overlay>
            :
              null
          }
          {
            items.nombre_tabla === 'condiciones_locativas' ?
              <Overlay
                visible={this.state.isVisibleActividad2}
                animationType="zoomIn"
                onClose={() => this.setState({isVisibleActividad2: false,isLoadActividad:false})}
                containerStyle={{backgroundColor: "rgba(0, 0, 0, .8)", width:"auto",height:"auto"}}
                childrenWrapperStyle={{backgroundColor: "rgba(255, 255, 255, 1)", borderRadius: 10}}
              >
                {
                /***
                * Mostrar layout luego de cargar los datos
                */
                !this.state.isLoadActividad && this.state.isVisibleActividad2?
                  <View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color={COLOR.azul} /></View>
                :
                  <View style={{justifyContent:'space-between', width:"100%"}}>
                    <TouchableOpacity style={{marginBottom:10, width:50}} onPress={() => this.setState({isVisibleActividad2: false,isLoadActividad:false})}><Image style={styles.iconoBoton} source={Imagen.back}></Image></TouchableOpacity>
                    <ScrollView>
                      <Text style={[styles.textDocumento,{marginTop:0,marginLeft:0}]}>{this.state.isLoadActividad ? this.state.documentos.condicion : ''}</Text>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Bueno'} checked={this.state.checked2}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Malo'} checked={this.state.checked2}></RadioButton>
                      <Text style={styles.textDescFoto}>Foto de la condicion locativa</Text>
                      <ListItem thumbnail style={{marginLeft:0}}>
                        <Left>
                          <TouchableOpacity onPress={() => this.verImagen(true,-1)}>
                            <Image ref={component => this._img1 = component} style={{width: 50, height: 50}} source={{uri: this.state.isLoadActividad ? this.state.imgVencido : Imagen.noDisponible}}></Image>
                          </TouchableOpacity>
                        </Left>
                        <Body style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                          <Button iconLeft regular block info style={[styles.boton, styles.actualizar,{marginLeft:10,marginRight:10,marginBottom:0}]} onPress={() => this.openFilePicker(true,-1)}><Image style={styles.iconoBoton} source={Imagen.find}></Image><Text>Cargar</Text></Button>
                        </Body>
                        <Right style={{borderBottomColor: 'rgba(255,255,255,0)',paddingRight:0}}>
                          <Button regular block info style={[styles.boton, styles.actualizar,{marginLeft:0,marginRight:0,marginBottom:0}]} onPress={() => this.setState({isVisibleCam:true,takePicture:{vencido:true,index:-1}})}><Icon style={styles.iconoBoton} ios="ios-camera" android="md-camera"></Icon></Button>
                        </Right>
                      </ListItem>
                      <Form>
                        <Textarea bordered placeholder="Observaciones" defaultValue={this.state.isLoadActividad ? this.state.documentos.observaciones : ''} style={[styles.observaciones,{marginTop:0,marginLeft:0,marginRight:0}]} onChangeText={(text) => this.setState({observacion2: text})} />
                      </Form>
                      <Button disabled={this.state.disable} success regular block style={[styles.boton, styles.finalizar, {marginTop:10,marginLeft:20,marginRight:20}]} onPress={() => {this.setState({disable:true}); this.UpdateDataCondicion()}}><Text> Actualizar </Text></Button>
                    </ScrollView>
                  </View>
                }
              </Overlay>
            :
              null
          }
          {
            items.nombre_tabla === 'examen_gimed' ?
              <Overlay
                visible={this.state.isVisibleActividad3}
                animationType="zoomIn"
                onClose={() => this.setState({isVisibleActividad3: false})}
                containerStyle={{backgroundColor: "rgba(0, 0, 0, .8)", width:"auto",height:"auto"}}
                childrenWrapperStyle={{backgroundColor: "rgba(255, 255, 255, 1)", borderRadius: 10}}
              >
                <View style={{justifyContent:'space-between', width:"100%"}}>
                  <TouchableOpacity style={{marginBottom:10, width:50}} onPress={() => this.setState({isVisibleActividad3: false})}><Image style={styles.iconoBoton} source={Imagen.back}></Image></TouchableOpacity>
                  <ScrollView>
                    <Text style={[styles.textDocumento,{marginLeft:0,marginTop:0}]}>{this.state.isVisibleActividad3 && this.state.examen[this.state.selected].vendedor}</Text>
                    <RadioButton SetChecked={this.SetChecked} i={5} value={'Favorable'} checked={this.state.checked2}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={1} value={'Desfavorable'} checked={this.state.checked2}></RadioButton>
                    <Text style={[styles.textDescFoto,{marginBottom:10}]}>Productos consultados:</Text>
                    <Autocomplete
                      autoCapitalize="none"
                      data={prods}
                      defaultValue={query}
                      onChangeText={text => this.BuscarProducto(text,'4301',0)}//4301 - dk GIMED
                      placeholder="Producto a buscar"
                      inputContainerStyle={[styles.autocompletar,{marginLeft:0,marginRight:0}]}
                      listStyle={styles.autocompletarLista}
                      renderItem={item => (
                        <TouchableOpacity onPress={() => {this.setState({ query: '', PRODUCTS: [...this.state.PRODUCTS, {nombre_comercial:item.nombre_comercial,cant:1,codigo:item.codigo,laboratorio_id:item.laboratorio_id}] })} }>
                          <Text style={styles.producto}>{item.nombre_comercial}</Text>
                        </TouchableOpacity>
                      )}
                    />
                    <List dataArray={this.state.PRODUCTS}
                      renderRow={(item) =>
                        <View style={{flex:1, flexDirection:'row', justifyContent:'space-between'}}>
                          <View style={{flex:1, justifyContent:'flex-start'}}>
                            <ListItem button onPress={() => {var array = [...this.state.PRODUCTS]; var ind = array.indexOf(item); array.splice(ind,1); this.setState({PRODUCTS: array, updated:true}, () => {this.forceUpdate();})}}>
                              <Icon ios='ios-trash' android="md-trash" style={{color: '#d9534f', fontSize: 20}}></Icon>
                              <Text style={styles.productosList}>{item.nombre_comercial}</Text>
                            </ListItem>
                          </View>
                        </View>
                      }>
                    </List>
                    <Button disabled={this.state.disable} success regular block style={[styles.boton, styles.finalizar, {marginTop:10,marginLeft:20,marginRight:20}]} onPress={() => {this.setState({disable:true}); this.UpdateDataExamenGimed()}}><Text> Actualizar </Text></Button>
                  </ScrollView>
                </View>
              </Overlay>
            :
              null
          }
          {
            items.nombre_tabla === 'relacion_vendedores' ?
              <Overlay
                visible={this.state.isVisibleActividad3}
                animationType="zoomIn"
                onClose={() => this.setState({isVisibleActividad3: false})}
                containerStyle={{backgroundColor: "rgba(0, 0, 0, .8)", width:"auto",height:"auto"}}
                childrenWrapperStyle={{backgroundColor: "rgba(255, 255, 255, 1)", borderRadius: 10}}
              >
                <View style={{justifyContent:'space-between', width:"100%"}}>
                  <TouchableOpacity style={{marginBottom:10, width:50}} onPress={() => this.setState({isVisibleActividad3: false})}><Image style={styles.iconoBoton} source={Imagen.back}></Image></TouchableOpacity>
                  <ScrollView>
                    <Text style={[styles.textDocumento,{marginLeft:0,marginTop:0}]}>{this.state.isVisibleActividad3 && this.state.relacion_vendedores[this.state.selected].vendedor}</Text>
                    <Text style={[styles.textDescFoto,{marginBottom:10}]}>Conoce sus objetivos y proyecciones de VENTA a la fecha:</Text>
                    <RadioButton SetChecked={this.SetChecked} i={5} value={' Si'} checked={this.state.isVisibleActividad3 && this.state.relacion_vendedores[this.state.selected].conoce_objetivos}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={1} value={' No'} checked={this.state.isVisibleActividad3 && this.state.relacion_vendedores[this.state.selected].conoce_objetivos}></RadioButton>                    
                    <Text style={[styles.textDescFoto,{marginBottom:10}]}>Proyección Venta General: </Text>
                    <Input keyboardType='numeric' style={[styles.input,{marginLeft:0,marginRight:0}]} placeholderTextColor={COLOR.gris} placeholder="Valor" defaultValue={this.state.isVisibleActividad3?this.NumberFormat(this.state.relacion_vendedores[this.state.selected].proyeccion_venta_general) : ''} onChangeText={text => {var data = this.state.relacion_vendedores; data[this.state.selected].proyeccion_venta_general = text.replace(/[.%-]/g,''); this.setState({relacion_vendedores:data })} }></Input>
                    <Text style={[styles.textDescFoto,{marginBottom:10}]}>% GIMED / Venta General: </Text>
                    <Input keyboardType='numeric' style={[styles.input,{marginLeft:0,marginRight:0}]} placeholderTextColor={COLOR.gris} placeholder="valor" defaultValue={this.state.isVisibleActividad3?this.NumberFormat(this.state.relacion_vendedores[this.state.selected].gimed_vs_venta_general) : ''} onChangeText={text => {var data = this.state.relacion_vendedores; data[this.state.selected].gimed_vs_venta_general = text.replace(/[.%-]/g,''); this.setState({relacion_vendedores:data })} }></Input>
                    <Text style={[styles.textDescFoto,{marginBottom:10}]}>% Ordinario / Venta General: </Text>
                    <Input keyboardType='numeric' style={[styles.input,{marginLeft:0,marginRight:0}]} placeholderTextColor={COLOR.gris} placeholder="Valor" defaultValue={this.state.isVisibleActividad3?this.NumberFormat(this.state.relacion_vendedores[this.state.selected].ordinario_vs_venta_general) : ''} onChangeText={text => {var data = this.state.relacion_vendedores; data[this.state.selected].ordinario_vs_venta_general = text.replace(/[.%-]/g,''); this.setState({relacion_vendedores:data })} }></Input>
                    <Text style={[styles.textDescFoto,{marginBottom:10}]}>Conoce los indicados:</Text>
                    <RadioButton SetChecked={this.SetChecked} i={5} value={' Si '} checked={this.state.isVisibleActividad3 && this.state.relacion_vendedores[this.state.selected].conoce_indicados}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={1} value={' No '} checked={this.state.isVisibleActividad3 && this.state.relacion_vendedores[this.state.selected].conoce_indicados}></RadioButton>
                    <ListItem style={{marginLeft:0,paddingTop:0,paddingBottom:0,paddingRight:0, borderBottomWidth:0}} onPress={() => {var data = this.state.relacion_vendedores; data[this.state.selected].agenda_los_clientes = !data[this.state.selected].agenda_los_clientes; this.setState({relacion_vendedores:data})}}>
                      <CheckBox checked={this.state.isVisibleActividad3 && this.state.relacion_vendedores[this.state.selected].agenda_los_clientes} color={COLOR.verde} onPress={() => {var data = this.state.relacion_vendedores; data[this.state.selected].agenda_los_clientes = !data[this.state.selected].agenda_los_clientes; this.setState({relacion_vendedores:data})}}/>
                      <Body>
                        <Text style={[styles.textDescFoto,{marginBottom:10}]}>Tiene agendados los clientes:</Text>
                      </Body>
                    </ListItem>
                    <Text style={[styles.textDescFoto,{marginBottom:10}]}>Cuantos Activos: </Text>
                    <Input editable={this.state.isVisibleActividad3 && this.state.relacion_vendedores[this.state.selected].agenda_los_clientes} keyboardType='numeric' style={[styles.input,{marginLeft:0,marginRight:0}]} placeholderTextColor={COLOR.gris} placeholder="valor" defaultValue={this.state.isVisibleActividad3? this.state.relacion_vendedores[this.state.selected].cuantos_clientes_activos : ''} onChangeText={text => {var data = this.state.relacion_vendedores; data[this.state.selected].cuantos_clientes_activos = text; this.setState({relacion_vendedores:data })} }></Input>
                    <Text style={[styles.textDescFoto,{marginBottom:10}]}>Presentación Personal:</Text>
                    <RadioButton SetChecked={this.SetChecked} i={5} value={' Buena'} checked={this.state.isVisibleActividad3 && this.state.relacion_vendedores[this.state.selected].presentacion_personal}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={1} value={' Mala'} checked={this.state.isVisibleActividad3 && this.state.relacion_vendedores[this.state.selected].presentacion_personal}></RadioButton>
                    <Text style={[styles.textDescFoto,{marginBottom:10}]}>Porta el carnet personal:</Text>
                    <RadioButton SetChecked={this.SetChecked} i={5} value={' Si  '} checked={this.state.isVisibleActividad3 && this.state.relacion_vendedores[this.state.selected].porta_carnet}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={1} value={' No  '} checked={this.state.isVisibleActividad3 && this.state.relacion_vendedores[this.state.selected].porta_carnet}></RadioButton>
                    <ListItem style={{marginLeft:0,paddingTop:0,paddingBottom:0,paddingRight:0, borderBottomWidth:0}} onPress={() => {var data = this.state.relacion_vendedores; data[this.state.selected].no_cumple_cuotas = !data[this.state.selected].no_cumple_cuotas; this.setState({relacion_vendedores:data})}}>
                      <CheckBox checked={this.state.isVisibleActividad3 && this.state.relacion_vendedores[this.state.selected].no_cumple_cuotas} color={COLOR.verde} onPress={() => {var data = this.state.relacion_vendedores; data[this.state.selected].no_cumple_cuotas = !data[this.state.selected].no_cumple_cuotas; this.setState({relacion_vendedores:data})}}/>
                      <Body>
                        <Text style={[styles.textDescFoto,{marginBottom:10}]}>Tiene más de tres meses sin cumplir cuotas:</Text>
                      </Body>
                    </ListItem>
                    <Text style={[styles.textDescFoto,{marginBottom:10}]}>Diagnostico o causas del bajo rendimiento:</Text>
                    <Form>
                      <Textarea disabled={this.state.isVisibleActividad3 && !this.state.relacion_vendedores[this.state.selected].no_cumple_cuotas} bordered placeholder="Observaciones" defaultValue={this.state.isLoadActividad3 ? this.state.relacion_vendedores[this.state.selected].diagnostico : ''} style={[styles.observaciones,{marginTop:0,marginLeft:0,marginRight:0}]} onChangeText={(text) => {var data = this.state.relacion_vendedores; data[this.state.selected].diagnostico = text; this.setState({relacion_vendedores: data})}} />
                    </Form>
                    <Text style={[styles.textDescFoto,{marginBottom:10}]}>Trabajo de recuperación, Seguimiento y toma de deciciones:</Text>
                    <Form>
                      <Textarea disabled={this.state.isVisibleActividad3 && !this.state.relacion_vendedores[this.state.selected].no_cumple_cuotas} bordered placeholder="Observaciones" defaultValue={this.state.isLoadActividad3 ? this.state.relacion_vendedores[this.state.selected].toma_de_deciciones : ''} style={[styles.observaciones,{marginTop:0,marginLeft:0,marginRight:0}]} onChangeText={(text) => {var data = this.state.relacion_vendedores; data[this.state.selected].toma_de_deciciones = text; this.setState({relacion_vendedores: data})}} />
                    </Form>
                    <Button disabled={this.state.disable} success regular block style={[styles.boton, styles.finalizar, {marginTop:10,marginLeft:20,marginRight:20}]} onPress={() => {this.setState({disable:true}); this.setState({isVisibleActividad3:false,disable:false})}}><Text> Actualizar </Text></Button>
                  </ScrollView>
                </View>
              </Overlay>
            :
              null
          }
          {
            items.nombre_tabla === 'senalizacion' ?
              <Overlay
                visible={this.state.isVisibleActividad3}
                animationType="zoomIn"
                onClose={() => this.setState({isVisibleActividad3: false})}
                containerStyle={{backgroundColor: "rgba(0, 0, 0, .8)", width:"auto",height:"auto"}}
                childrenWrapperStyle={{backgroundColor: "rgba(255, 255, 255, 1)", borderRadius: 10}}
              >
                <View style={{justifyContent:'space-between', width:"100%"}}>
                  <TouchableOpacity style={{marginBottom:10, width:50}} onPress={() => this.setState({isVisibleActividad3: false})}><Image style={styles.iconoBoton} source={Imagen.back}></Image></TouchableOpacity>
                  <ScrollView>
                    <Text style={[styles.textDescFoto,{marginBottom:10}]}>{this.state.isVisibleActividad3 && this.state.senalizacion[this.state.selected].senalizacion} tiene señalización?</Text>
                    <RadioButton SetChecked={this.SetChecked} i={5} value={'  Si'} checked={this.state.isVisibleActividad3 && this.state.senalizacion[this.state.selected].respuesta}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={1} value={'  No'} checked={this.state.isVisibleActividad3 && this.state.senalizacion[this.state.selected].respuesta}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={0} value={'  N/A'} checked={this.state.isVisibleActividad3 && this.state.senalizacion[this.state.selected].respuesta}></RadioButton>
                    <Text style={[styles.textDescFoto,{marginBottom:10}]}>Observaciones:</Text>
                    <Form>
                      <Textarea bordered placeholder="Observaciones" defaultValue={this.state.isVisibleActividad3 ? this.state.senalizacion[this.state.selected].observaciones : ''} style={[styles.observaciones,{marginTop:0,marginLeft:0,marginRight:0}]} onChangeText={(text) => {var data = this.state.senalizacion; data[this.state.selected].observaciones = text; this.setState({senalizacion: data})}} />
                    </Form>
                    <Button disabled={this.state.disable} success regular block style={[styles.boton, styles.finalizar, {marginTop:10,marginLeft:20,marginRight:20}]} onPress={() => {this.setState({disable:true}); this.setState({isVisibleActividad3:false,disable:false})}}><Text> Actualizar </Text></Button>
                  </ScrollView>
                </View>
              </Overlay>
            :
              null
          }
          {
            (items.nombre_tabla === 'documentacion_legal' || items.nombre_tabla === 'condiciones_locativas' || items.nombre_tabla === 'actividades_ptc' || items.nombre_tabla === 'solicitud_seguro' || items.nombre_tabla === 'contratos_anexos_legalizacion') ?
              <Overlay
                visible={this.state.isVisible2}
                closeOnTouchOutside 
                animationType="zoomIn"
                onClose={() => this.setState({isVisible2: false})}
                containerStyle={{backgroundColor: "rgba(0, 0, 0, .5)", width:"auto",height:"auto"}}
                childrenWrapperStyle={{backgroundColor: "rgba(0, 0, 0, 0)", borderRadius: 10}}
              >
                <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}}>
                  <Text onPress={() => this.setState({isVisible2: false})} style={{color: 'white', textAlign:'right', alignSelf:'flex-end'}}>X</Text>
                  <Image style={{height: 500, width:280}} source={{uri: imgOverlay}}></Image>
                </View>
              </Overlay>
            :
              null
          }
          <Overlay
            visible={this.state.isVisibleCam}
            closeOnTouchOutside 
            animationType="zoomIn"
            onClose={() => this.setState({isVisibleCam: false})}
            containerStyle={{backgroundColor: "rgba(0, 0, 0, 1)", width:"auto",height:"auto",padding:0}}
            childrenWrapperStyle={{backgroundColor: "rgba(255, 255, 255, 1)", padding:0}}
          >
            <View style={{height:"100%",width:"100%"}}>
              <Camara setImage={this.setImage}></Camara>
            </View>
          </Overlay>
          <Overlay
            visible={this.state.loading2}
            closeOnTouchOutside={false}
            onClose={() => this.setState({loading2: true})}
            animationType="zoomIn"
            containerStyle={{backgroundColor: "rgba(0, 0, 0, .3)", width:"auto",height:"auto"}}
            childrenWrapperStyle={{backgroundColor: "rgba(0, 0, 0, 0)", borderRadius: 10}}
          >
            {this.state.loading2 && <View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color={COLOR.azul} /></View>}
          </Overlay>
        </Container>
      </Drawer>
    );
  }
}