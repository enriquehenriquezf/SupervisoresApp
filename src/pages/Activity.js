import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, Text, Icon, Button, Spinner, Textarea, Form,List, ListItem, H2, Card, Input, Picker, DatePicker, Drawer } from 'native-base';
import {toastr} from '../components/Toast';
import {View,Platform, BackHandler, KeyboardAvoidingView, AsyncStorage, Image,TouchableOpacity,FlatList, ScrollView, Keyboard} from 'react-native';
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
export default class Activity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      archivo: {},
      archivo2: {},
      loading: true,
      checked: 1 ,
      checked2: 1 ,
      calificacion_pv: 'Completo',
      observacion: '',
      observacion2: '',
      latitude: null,
      longitude: null,
      error:null,
      isVisible: false,
      isVisible2: false,
      isVisibleActividad: false,
      isVisibleActividad2: false,
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
      showToast: false
    };
    let token = this.props.token;
    items = this.props.data;
    time = 0;
    totalTime = 0;
    totalTimeInit = new Date().getTime();
    timeInit = new Date().getTime();
    imgOverlay = '';
    items2 = [];
    this.SetChecked = this.SetChecked.bind(this);
    this.ModificarProducto = this.ModificarProducto.bind(this);
    this.setDate = this.setDate.bind(this);
    this.closeDrawer = this.closeDrawer.bind(this);
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
    //this._retrieveDataInit();
    this._retrieveData();
    //this._retrieveDataAusente();
    this.setState({ loading: false });
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
          that.SetChecked(1,'Si');
        }
        else if(item.estado_documento === 'No')
        {
          that.SetChecked(2,'No');
        }
      }
      else{        
        console.log(response);
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
        that.setState({isVisibleActividad:false,isLoadActividad:false,disable:false});
        toastr.showToast(token2["message"],'success');
      }
      else{        
        console.log(response);
      }
    }).catch(function(error){
      //toastr.showToast('Su sesión expiró','danger');
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
            (data.estado_condicion === 'Si' || data.estado_condicion === 'No') ?
              <Picker.Item key={Math.floor(Math.random() * 1000) + 1} label={data.condicion} value={index} color={'#5cb85c'} />
            :
              <Picker.Item key={Math.floor(Math.random() * 1000) + 1} label={data.condicion} value={index} color={'#000000'} />
          )
        })
        that.setState({lista:Lista});
      }
      else{        
        console.log(response);
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
        if(item.estado_condicion === 'Si' || item.estado_condicion === '' || item.estado_condicion === null)
        {
          that.SetChecked(1,'Si');
        }
        else if(item.estado_condicion === 'No')
        {
          that.SetChecked(2,'No');
        }
      }
      else{        
        console.log(response);
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
        that.setState({isVisibleActividad2:false,isLoadActividad:false,disable:false});
        toastr.showToast(token2["message"],'success');
      }
      else{        
        console.log(response);
      }
    }).catch(function(error){
      //toastr.showToast('Su sesión expiró','danger');
      console.log(error);
    });
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

  componentDidMount()
  {
    //console.log(items);
    /** Agregar el metodo handleBackPress al evento de presionar el boton "Back" de android */
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    /**
     * Seleccionar el radioButton que se obtuvo de la base de datos
     */
    if(items.calificacion_pv === 'Puntual' && items.nombre_tabla === 'apertura')
    {
      this.SetChecked(1,'Puntual');
    }
    else if((items.calificacion_pv === null || items.calificacion_pv === 'noalificado') && items.nombre_tabla === 'apertura')
    {
      this.SetChecked(1,'Puntual');
    }
    else if(items.calificacion_pv === 'Tarde')
    {
      this.SetChecked(2,'Tarde');
    }
    else if(items.calificacion_pv === 'Muy Tarde')
    {
      this.SetChecked(3,'Muy Tarde');
    }
    else if(items.calificacion_pv === 'Completo')
    {
      this.SetChecked(1,'Completo');
    }
    else if(items.calificacion_pv === 'Al día' && (items.nombre_tabla === 'libros_faltantes' || items.nombre_tabla === 'ingreso_sucursal'))
    {
      this.SetChecked(1,'Al día');
    }
    else if((items.calificacion_pv === null || items.calificacion_pv === 'noalificado') && (items.nombre_tabla === 'libros_faltantes' || items.nombre_tabla === 'ingreso_sucursal'))
    {
      this.SetChecked(1,'Al día');
    }
    else if(items.calificacion_pv === 'Pendiente')
    {
      this.SetChecked(2,'Pendiente');
    }
    else if(items.calificacion_pv === 'Excelentes' && items.nombre_tabla === 'condiciones_locativas')
    {
      this.SetChecked(1,'Excelentes');
    }
    else if((items.calificacion_pv === null || items.calificacion_pv === 'noalificado') && items.nombre_tabla === 'condiciones_locativas')
    {
      this.SetChecked(1,'Excelentes');
    }
    else if(items.calificacion_pv === 'Buenas')
    {
      this.SetChecked(2,'Buenas');
    }
    else if(items.calificacion_pv === 'Regulares')
    {
      this.SetChecked(3,'Regulares');
    }
    else if(items.calificacion_pv === 'Malas')
    {
      this.SetChecked(4,'Malas');
    }
    else if(items.calificacion_pv === 'Pesimas')
    {
      this.SetChecked(5,'Pesimas');
    }    
    else if(items.calificacion_pv === null || items.calificacion_pv === 'noalificado')
    {
      this.SetChecked(1,'Completo');
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

    this.setState({observacion: items.observacion, numero_consecutivo: items.numero_consecutivo,PRODUCTS: array,LABORATORIES: array2, productos2: array3, PRODUCTS2: array2});
    /**
     * Obtener la geoposicion del dispositivo y verificar que se encuentre dentro del rango de la sucursal.
     * @example rango: a una distancia de 5000*10^-7 grados de latitud y longitud
     */
    var lat = 0;
    var long = 0;
    var RANGO = 0.0005000
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        //console.log("Pos:");
        //console.log(position);
        lat = position.coords.latitude;
        long = position.coords.longitude;
        if((lat >= items.latitud-RANGO && lat <= items.latitud+RANGO) && (long >= items.longitud-RANGO && long <= items.longitud+RANGO))
        {
          toastr.showToast('Se encuentra dentro de ' + items.sucursal,'info');
        }
        else
        {
          toastr.showToast('Está fuera del rango de ' + items.sucursal,'danger');
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
      { enableHighAccuracy: false, timeout: 60000, maximumAge: 1000 },
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
    if(calificacion_pv === 'Si' || calificacion_pv === 'No'){
      var docs = this.state.documentos;
      docs.estado_documento = calificacion_pv;
      docs.estado_condicion = calificacion_pv;
      this.setState({ checked2: i, documentos: docs });
    }
    else{
      this.setState({ checked: i, calificacion_pv: calificacion_pv });
    }
  }

  /**
   * Enviar calificaciones de la actividad a la base de datos
   * @param {function} handler ir al layout de home luego de enviar los datos.
   */
  async FinishActivity(handler)
  {
    let bodyInit = JSON.parse(token._bodyInit);
    let handler2 = this.props.handler2;
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    let id = items.id_actividad;
    this._storeData();
    this._storeDataAusente();
    var totalTl = new Date().getTime();
    totalTime = totalTl - totalTimeInit;

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
        calificacion_pv: this.state.calificacion_pv, 
        nombre_tabla: items.nombre_tabla,
        id_plan_trabajo: items.id_plan_trabajo, 
        id_actividad: id,
        observaciones: this.state.observacion,
        productos: JSON.stringify(this.state.PRODUCTS),
        numero_consecutivo:this.state.numero_consecutivo,
        laboratorios_realizados: JSON.stringify(this.state.PRODUCTS2),
        tiempo_actividad: time,
        tiempo_total: totalTime,
        motivo_ausencia: items.motivo_ausencia
      })
    }).then(function(response) {
      //console.log(response);
      newToken = JSON.parse(response._bodyInit);
      var message = "message";
      if(response.ok === true && response.status === 200)
      {
        toastr.showToast(newToken[message],'success');
        handler(1,token,[]);
      }
      else
      {
        console.log(response);
        if(response.status === 500){
          toastr.showToast('Error con el servidor','danger');
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
    if(items.estado === 'activo' || items.estado ==='Activo'){
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
  openFilePicker = async (vencido) => {
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
    }
    catch(error){
      console.log(error);
    }
  }

  /**
   * Muestra el overlay con la imagen en pantalla completa
   * @param {boolean} vencido 
   */
  verImagen(vencido){
    if(vencido){
      imgOverlay = this.state.imgVencido;
    }
    else{imgOverlay = this.state.imgRenovado;}
    this.setState({isVisible2: true});
  }

  /** buscar productos */
  BuscarProducto(query, lab, index){
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    let prods = [];
    var that = this;
    let {query2} = this.state;
    query2[index] = query;
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
          array[index] = {...array[index], prods: prods};
          that.setState({productos: prods, query: query, query2, productos2: array});
        }
        else
        {
          console.log(response);
          if(response.status === 500){
            toastr.showToast('Error con el servidor','danger');
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
          if(response.status === 500){
            toastr.showToast('Error con el servidor','danger');
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
      return (<View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color='blue' /></View>);
    }
    
    const { query,query3 } = this.state;
    const prods = this.findProduct(query);
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
          <KeyboardAvoidingView behavior="padding" enabled style={{flex: Platform.OS === 'ios' ? 0.7 : 1}}>
            <Content keyboardShouldPersistTaps='true'>
              <Text style={styles.sucursal}>{items.sucursal}</Text>
              <H2 style={styles.actividad}>{items.name}</H2>
              <Card style={{marginBottom: 10, marginTop: 10, elevation:0, borderColor:'rgba(255,255,255,0)'}}>
                {
                  items.nombre_tabla === 'apertura' ?
                    <View>
                      <Text style={styles.textInfo}>Hora de apertura: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Puntual'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={2} value={'Tarde'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={3} value={'Muy Tarde'} checked={this.state.checked}></RadioButton>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'kardex' ?
                    <View>
                      <Text style={styles.textInfo}>Elaboración: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
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
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Excelentes'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={2} value={'Buenas'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={3} value={'Regulares'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={4} value={'Malas'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={5} value={'Pesimas'} checked={this.state.checked}></RadioButton>
                      
                      <Picker
                          textStyle={styles.picker}
                          mode="dropdown"
                          selectedValue={this.state.selected}
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
                  items.nombre_tabla === 'convenio_exhibicion' ?
                    <View>
                      <Text style={styles.textInfo}>Verificar permanencia de las exhibiciones: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'libros_faltantes' ?
                    <View>
                      <Text style={styles.textInfo}>Verificar libros faltantes a la fecha: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Al día'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <Text style={styles.textDocumento}>Productos a vencer: </Text>
                      <Autocomplete
                        autoCapitalize="none"
                        data={prods}
                        defaultValue={query}
                        onChangeText={text => this.BuscarProducto(text,'')}
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
                      <Input placeholder="Número Consecutivo" defaultValue={this.state.numero_consecutivo} onChangeText={text => this.setState({numero_consecutivo: text})}></Input>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'ingreso_sucursal' ?
                    <View>
                      <Text style={styles.textInfo}>Reporte de ingreso: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Al día'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'formulas_despachos' ?
                    <View>
                      <Text style={styles.textInfo}>Se debe revisar estén descargadas del sistema todas las fórmulas y pendientes:</Text>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'captura_cliente' ?
                    <View>
                      <Text style={styles.textInfo}>Captación de clientes: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                    </View>
                  :
                    null
                }              
                {
                  items.nombre_tabla === 'documentacion_legal' ?
                    <View>
                      <Text style={styles.textInfo}>Verificar Documentación legal: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>

                        <Picker
                          textStyle={styles.picker}
                          mode="dropdown"
                          selectedValue={this.state.selected}
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
                  items.nombre_tabla === 'evaluacion_pedidos' ?
                    <View>
                      <Text style={styles.textInfo}>Pedidos realizados vs Remision: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <Input placeholder="Número revisión"></Input>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'excesos' ?
                    <View>
                      <Text style={styles.textInfo}>Revisar pedidos y excesos: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'libro_agendaclientes' ?
                    <View>
                      <Text style={styles.textInfo}>Revisar agenda de clientes: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                    </View>
                  :
                    null
                }              
                {
                  items.nombre_tabla === 'libro_vencimientos' ?
                    <View>
                      <Text style={styles.textInfo}>Confirmar que estén separados los productos del libro de vencimientos: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                      <Text style={styles.textInfo}>Productos a vencer: </Text>
                      <Autocomplete
                        autoCapitalize="none"
                        data={prods}
                        defaultValue={query}
                        onChangeText={text => this.BuscarProducto(text,'')}
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
                                <Text style={[styles.textInfo,{margin:0,marginLeft: 5}]}>Fecha de Vencimiento: </Text>
                              </View>
                              <View style={{flex:4, justifyContent:'flex-start', marginTop:-10}}>
                                <DatePicker
                                  defaultDate={new Date(item.fecha_vencimiento)}
                                  minimumDate={new Date(2019, 0, 1)}
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
                  items.nombre_tabla === 'papeleria_consignaciones' ?
                    <View>
                      <Text style={styles.textInfo}>Verificar la papelería: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'presupuesto_pedido' ?
                    <View>
                      <Text style={styles.textInfo}>Revisar metodología utilizada para revisar el pedido: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'remisiones' ?
                    <View>
                      <Text style={styles.textInfo}>Revisar remisiones grabadas a la fecha: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'revision_completa_inventario' ?
                    <View>
                      <Text style={styles.textInfo}>Revision completa de los inventarios: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                    </View>
                  :
                    null
                }
                {
                  items.nombre_tabla === 'seguimiento_vendedores' ?
                    <View>
                      <Text style={styles.textInfo}>Revisión del desempeño de cada vendedor: </Text>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
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
                          style={{ width: undefined }}
                          itemStyle={styles.picker}
                          selectedValue={this.state.motivo}
                          onValueChange={this.onValueChange.bind(this)}
                        >
                          <Picker.Item label="SINIESTRO" value="0" />
                          <Picker.Item label="VISITAS DE ENTIDADES PÚBLICAS" value="1" />
                          <Picker.Item label="REQUERIMIENTO GERENCIAL" value="2" />
                          <Picker.Item label="AUSENCIA ADMINISTRADOR" value="3" />
                          <Picker.Item label="TRABAJO ESPECIAL" value="4" />
                        </Picker>
                      </View>
                    :
                      null
                  }
                  <Textarea rowSpan={2} bordered placeholder="Observaciones" defaultValue={items.observacion} style={styles.observaciones} onChangeText={(text) => this.setState({observacion: text})} />
                </Form>
              </Card>
              {
                items.estado === 'Activo' || items.estado === 'activo' ?
                  <Button success regular block style={[styles.boton, styles.finalizar]} onPress={() => this.FinishActivity(this.props.handler2)}><Text style={styles.textButton}> Finalizar </Text></Button>
                :              
                  <Button info regular block style={[styles.boton, styles.actualizar]} onPress={() => this.FinishActivity(this.props.handler2)}><Text style={styles.textButton}> Modificar </Text></Button>
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
                  <View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color='blue' /></View>
                :
                  <View>
                    <ScrollView>
                      <Text style={styles.textDocumento}>{this.state.isLoadActividad ? this.state.documentos.documento : ''}</Text>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Si'} checked={this.state.checked2}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={2} value={'No'} checked={this.state.checked2}></RadioButton>
                      <Text style={styles.textDescFoto}>Documento Vencido</Text>
                      <ListItem thumbnail style={{marginLeft:0}}>
                        <Left>
                          <TouchableOpacity onPress={() => this.verImagen(true)}>
                            <Image ref={component => this._img1 = component} style={{width: 50, height: 50}} source={{uri: this.state.isLoadActividad ? this.state.imgVencido : Imagen.noDisponible}}></Image>
                          </TouchableOpacity>
                        </Left>
                        <Body style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                          <Button iconLeft regular block info style={[styles.boton, styles.actualizar,{marginLeft:0,marginRight:0,marginBottom:0}]} onPress={() => this.openFilePicker(true)}><Image style={styles.iconoBoton} source={Imagen.find}></Image><Text>Cargar Imagen</Text></Button>
                        </Body>
                      </ListItem>
                      <Text style={styles.textDescFoto}>Documento Renovado</Text>
                      <ListItem thumbnail style={{marginLeft:0}}>
                        <Left>
                          <TouchableOpacity onPress={() => this.verImagen(false)}>
                            <Image ref={component => this._img2 = component} style={{width: 50, height: 50}} source={{uri: this.state.isLoadActividad ? this.state.imgRenovado : Imagen.noDisponible}}></Image>
                          </TouchableOpacity>
                        </Left>
                        <Body style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                          <Button iconLeft regular block info style={[styles.boton, styles.actualizar,{marginLeft:0,marginRight:0,marginBottom:0}]} onPress={() => this.openFilePicker(false)}><Image style={styles.iconoBoton} source={Imagen.find}></Image><Text>Cargar Imagen</Text></Button>
                        </Body>
                      </ListItem>
                      <Form>
                        <Textarea bordered placeholder="Observaciones" defaultValue={this.state.isLoadActividad ? this.state.documentos.observaciones : ''} style={[styles.observaciones,{marginTop:0}]} onChangeText={(text) => this.setState({observacion2: text})} />
                      </Form>
                      <Button disabled={this.state.disable} success regular block style={[styles.boton, styles.finalizar, {marginTop:10}]} onPress={() => {this.setState({disable:true}); this.UpdateData()}}><Text> Actualizar </Text></Button>
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
                  <View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color='blue' /></View>
                :
                  <View>
                    <ScrollView>
                      <Text style={styles.textDocumento}>{this.state.isLoadActividad ? this.state.documentos.condicion : ''}</Text>
                      <RadioButton SetChecked={this.SetChecked} i={1} value={'Si'} checked={this.state.checked2}></RadioButton>
                      <RadioButton SetChecked={this.SetChecked} i={2} value={'No'} checked={this.state.checked2}></RadioButton>
                      <Text style={styles.textDescFoto}>Foto de la condicion locativa</Text>
                      <ListItem thumbnail style={{marginLeft:0}}>
                        <Left>
                          <TouchableOpacity onPress={() => this.verImagen(true)}>
                            <Image ref={component => this._img1 = component} style={{width: 50, height: 50}} source={{uri: this.state.isLoadActividad ? this.state.imgVencido : Imagen.noDisponible}}></Image>
                          </TouchableOpacity>
                        </Left>
                        <Body style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                          <Button iconLeft regular block info style={[styles.boton, styles.actualizar,{marginLeft:0,marginRight:0,marginBottom:0}]} onPress={() => this.openFilePicker(true)}><Image style={styles.iconoBoton} source={Imagen.find}></Image><Text>Cargar Imagen</Text></Button>
                        </Body>
                      </ListItem>
                      <Form>
                        <Textarea bordered placeholder="Observaciones" defaultValue={this.state.isLoadActividad ? this.state.documentos.observaciones : ''} style={[styles.observaciones,{marginTop:0}]} onChangeText={(text) => this.setState({observacion2: text})} />
                      </Form>
                      <Button disabled={this.state.disable} success regular block style={[styles.boton, styles.finalizar, {marginTop:10}]} onPress={() => {this.setState({disable:true}); this.UpdateDataCondicion()}}><Text> Actualizar </Text></Button>
                    </ScrollView>
                  </View>
                }
              </Overlay>
            :
              null
          }
          {
            (items.nombre_tabla === 'documentacion_legal' || items.nombre_tabla === 'condiciones_locativas') ?
              <Overlay
                visible={this.state.isVisible2}
                closeOnTouchOutside 
                animationType="zoomIn"
                onClose={() => this.setState({isVisible2: false})}
                containerStyle={{backgroundColor: "rgba(0, 0, 0, .5)", width:"auto",height:"auto"}}
                childrenWrapperStyle={{backgroundColor: "rgba(0, 0, 0, .5)", borderRadius: 10}}
              >
                <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}}>
                  <Text onPress={() => this.setState({isVisible2: false})} style={{color: 'white', textAlign:'right', alignSelf:'flex-end'}}>X</Text>
                  <Image style={{height: 500, width:280}} source={{uri: imgOverlay}}></Image>
                </View>
              </Overlay>
            :
              null
          }

        </Container>
      </Drawer>
    );
  }
}