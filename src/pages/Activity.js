import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, Text, Icon, Button, Spinner, Textarea, Form,List, ListItem, H2, Card, Input,ActionSheet, Picker, DatePicker } from 'native-base';
import {toastr} from '../components/Toast';
import {View,Platform, BackHandler, KeyboardAvoidingView, AsyncStorage, Image,TouchableOpacity} from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';
import NumericInput from 'react-native-numeric-input';
import Overlay from 'react-native-modal-overlay';
import styles from '../styles/Activity';
import IconStyles from '../styles/Icons';
import {api} from '../services/api';
import {Imagen} from '../components/Imagenes';
import { RadioButton } from '../components/RadioButton';

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
export default class Activity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      archivo: {},
      archivo2: {},
      loading: true,
      checked: 1 ,
      calificacion_pv: 'Puntual',
      observacion: '',
      latitude: null,
      longitude: null,
      error:null,
      isVisible: false,
      isVisible2: false,
      ausencia: false,
      motivo: '',
      productos:[],
      PRODUCTS:[],
      chosenDate: new Date(),
      showToast: false
    };
    let token = this.props.token;
    items = this.props.data;
    time = 0;
    totalTime = 0;
    timeInit = new Date().getTime();
    totalTimeInit = new Date().getTime();
    imgOverlay = '';
    imgTemp1 = api.ipImg + items.documento_vencido;
    imgTemp2 = api.ipImg + items.documento_renovado;
    this.SetChecked = this.SetChecked.bind(this);
    this.ModificarProducto = this.ModificarProducto.bind(this);
    this.setDate = this.setDate.bind(this);
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
    this._retrieveDataInit();
    this._retrieveData();
    this._retrieveDataAusente();
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
    if(items.calificacion_pv === 'Puntual')
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
    else if(items.calificacion_pv === 'Al día')
    {
      this.SetChecked(1,'Al día');
    }
    else if(items.calificacion_pv === 'Pendiente')
    {
      this.SetChecked(2,'Pendiente');
    }
    else if(items.calificacion_pv === 'Excelentes')
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
    this.setState({observacion: items.observacion});
    /**
     * Cambiar image Source por imagen no disponible si no se encuentra la url en la db
     */
    if(items.documento_vencido === '' || items.documento_vencido === null){//FIXME: modificar imagen no disponible
      //imgTemp1 = Imagen.noDisponible;
      this._img1.setNativeProps({src: [{uri: Imagen.noDisponible}]});
    }
    if(items.documento_renovado === '' || items.documento_renovado === null){
      //imgTemp2 = Imagen.noDisponible;
      this._img2.setNativeProps({src: [{uri: Imagen.noDisponible}]});
    }
    /**
     * Obtener la geoposicion del dispositivo y verificar que se encuentre dentro del rango de la sucursal.
     * @example rango: a una distancia de 5000*10^-7 grados de latitud y longitud
     */
    var lat = 0;
    var long = 0;
    var RANGO = 0.0005000
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        console.log("Pos:");
        console.log(position);
        /*this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
        });*/
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
    this.setState({ checked: i, calificacion_pv: calificacion_pv });
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
    /** Imagenes de documentacion legal */
    let file1 = null;
    let file2 = null;
    if(this.state.archivo.hasOwnProperty('uri')){
      await Expo.FileSystem.readAsStringAsync(this.state.archivo.uri, {encoding: Expo.FileSystem.EncodingTypes.Base64}).then(function(response){
        file1 = response;
      });
    }
    else{
      if(items.documento_vencido !== ''){
        file1 = imgTemp1;
      }
    }
    if(this.state.archivo2.hasOwnProperty('uri')){
      await Expo.FileSystem.readAsStringAsync(this.state.archivo2.uri, {encoding: Expo.FileSystem.EncodingTypes.Base64}).then(function(response){
        file2 = response;
      });
    }
    else{
      if(items.documento_renovado !== ''){
        file2 = imgTemp2;
      }
    }

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
        documento_vencido: file1,
        documento_renovado: file2,
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
    try {
      await AsyncStorage.setItem('TIME_AUSENTE_' + items.nombre_tabla + '_' + items.id_actividad, tl.toString());
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
   * Obtener datos de tiempo inicial de ausencia en el plan de trabajo
   */
  _retrieveDataAusente = async () => {
    try {
      const value = await AsyncStorage.getItem('TIME_AUSENTE_' + items.nombre_tabla + '_' + items.id_actividad);
      if (value !== null) {
        var t2 = new Date().getTime().toString();        
        var TiempoInact = 0;
        if(items.tiempoInactivoInit !== 0 && items.tiempoInactivoInit > totalTimeInit){
          TiempoInact = items.tiempoInactivo;
        }
        if((t2 - value) - TiempoInact > TIEMPOAUSENCIA){
          /*ActionSheet.show(
            {
              options: BUTTONS,
              title: "Motivo de Ausencia"
            },
            buttonIndex => {
              if(buttonIndex === undefined){
                toastr.showToast('Debe seleccionar una opción','warning');
                this.handleBackPress();
              }
              else{
                this.setState({
                  motivo: buttonIndex,
                  ausencia: true
                });
                this.forceUpdate();
              }
            }
          );*/          
          this.setState({
            motivo: '0',
            ausencia: true
          });
          
        }
        //console.log("TIME AUSENTE: " + totalTimeInit);
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Obtener datos de tiempo inicial del plan de trabajo
   */
  _retrieveDataInit = async () => {
    try {
      const value = await AsyncStorage.getItem('TIMEINIT_' + items.nombre_tabla + '_' + items.id_actividad);
      if (value !== null) {
        totalTimeInit = value;
        //console.log("TOTAL TIME INIT: " + totalTimeInit);
      }
      else{this._storeDataInit()}
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * Obtener datos de tiempo actual del plan de trabajo
   */
  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('TIME_' + items.nombre_tabla + '_' + items.id_actividad);
      if (value !== null) {
        time = value;
        //console.log("TIME: " + time);
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
          this.setState({archivo: attachment});
        }else{
          imgTemp2 = attachment.uri;
          this._img2.setNativeProps({src: [{uri: imgTemp2}]});//'data:image/png;base64,' + imgsource
          this.setState({archivo2: attachment});
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
      imgOverlay = imgTemp1;
    }
    else{imgOverlay = imgTemp2;}
    this.setState({isVisible2: true});
  }

  /** buscar productos */
  BuscarProducto(query){
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    let prods = [];
    var that = this;
    fetch(api.ipBuscarProducto, {
      method: 'POST',
      headers: {
          'Authorization': auth,
          'Content-Type': 'application/json',
          'Accept':'application/json'
      },
      body: JSON.stringify({
        nombre_producto: query.toLowerCase()
      })
    }).then(function(response) {
      //console.log(response);
      if(response.ok === true && response.status === 200)
      {
        newToken = JSON.parse(response._bodyInit);
        //console.log(Object.values(newToken));
        Object.values(newToken.productos['data']).forEach(element => {
          //console.log(Object.values(element));
          prods.push(element.nombre_comercial);
        });
        //console.log(prods)
        that.setState({productos: prods, query: query});
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
        }
      }
      //return response.json();
    }).catch(function(error){
      toastr.showToast('Su sesión expiró','danger');
      handler2 = true;
      console.log(error);
    });
  }

  /** buscar Laboratorios */
  BuscarLaboratorio(query){
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    let labs = [];
    var that = this;
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
        console.log(Object.values(newToken));
        Object.values(newToken.laboratorio['data']).forEach(element => {
          //console.log(Object.values(element));
          //labs.push(element.nombre_comercial);
        });
        //console.log(labs)
        //that.setState({laboratorios: labs, query: query});
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
        }
      }
      //return response.json();
    }).catch(function(error){
      toastr.showToast('Su sesión expiró','danger');
      handler2 = true;
      console.log(error);
    });
  }

  /**
   * Buscar y Filtrar Productos
   */
  findProduct(query) {
    if (query === '' || query === undefined) {
      return [];
    }
    //console.log(this.state.productos);
    return this.state.productos.filter(prod => prod.toLowerCase().search(query.toLowerCase()) >= 0);
  }

  /**
   * Borrar Producto de la lista PRODUCTS
   */
  BorrarProducto(item){
    var array = [...this.state.PRODUCTS];
    var index = array.indexOf(item)
    if (index !== -1) {
      array.splice(index, 1);
      this.setState({PRODUCTS: array});
    }
  }

  /**
   * Modificar Producto de la lista PRODUCTS
   */
  ModificarProducto(item,value){
    var array = [...this.state.PRODUCTS];
    var index = array.indexOf(item);
    if (index !== -1) {
      array[index] = {...array[index], cant: value};
      //console.log(array);
      this.setState({PRODUCTS: array});
      this.forceUpdate();
    }
  }
  /** Cambiar opcion de motivo de ausencia */
  onValueChange(value) {
    this.setState({
      motivo: value
    });
  }
  /** Cambiar fecha de vencimiento */
  setDate(newDate) {
    this.setState({ chosenDate: newDate });
  }

  render() {
    /***
     * Mostrar layout luego de cargar los datos
     */
    if (this.state.loading) {
      return (<View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color='blue' /></View>);
    }
    
    const { query } = this.state;
    const prods = this.findProduct(query);

    return (
      <Container>
        <Header style={{paddingTop: 20}}>
        <Left>
            <Button transparent style={IconStyles.back} onPress={() => this.handleBackPress()}>
                <Icon ios="ios-arrow-back" android="md-arrow-back" style={IconStyles.header}></Icon>
            </Button>
        </Left>          
        <Body>
          <Title>{items.sucursal}</Title>
        </Body>
        <Right>          
          <Button transparent onPress={() => this.setState({isVisible: true})}>
              <Icon ios="ios-help" android="md-help" style={IconStyles.help}></Icon>
          </Button>
        </Right>
        </Header>
        <KeyboardAvoidingView behavior="padding" enabled style={{flex: Platform.OS === 'ios' ? 0.7 : 1}}>
          <Content>
            <H2 style={{margin: 5}}>{items.name}</H2>
            <Card style={{marginBottom: 10, marginTop: 10}}>
              {
                items.nombre_tabla === 'apertura' ?
                  <View>
                    <Text style={{margin: 10}}>Hora de apertura: </Text>
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
                    <Text style={{margin: 10}}>Elaboración: </Text>
                    <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'condiciones_locativas' ?
                  <View>
                    <Text style={{margin: 10}}>Condiciones: </Text>
                    <RadioButton SetChecked={this.SetChecked} i={1} value={'Excelentes'} checked={this.state.checked}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={2} value={'Buenas'} checked={this.state.checked}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={3} value={'Regulares'} checked={this.state.checked}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={4} value={'Malas'} checked={this.state.checked}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={5} value={'Pesimas'} checked={this.state.checked}></RadioButton>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'convenio_exhibicion' ?
                  <View>
                    <Text style={{margin: 10}}>Verificar permanencia de las exhibiciones: </Text>
                    <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'libros_faltantes' ?
                  <View>
                    <Text style={{margin: 10}}>Verificar libros faltantes a la fecha: </Text>
                    <RadioButton SetChecked={this.SetChecked} i={1} value={'Al día'} checked={this.state.checked}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'ingreso_sucursal' ?
                  <View>
                    <Text style={{margin: 10}}>Reporte de ingreso: </Text>
                    <RadioButton SetChecked={this.SetChecked} i={1} value={'Al día'} checked={this.state.checked}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'formulas_despacho' ?
                  <View>
                    <Text style={{margin: 10}}>Reporte de ingreso: </Text>
                    <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'captura_cliente' ?
                  <View>
                    <Text style={{margin: 10}}>Captación de clientes: </Text>
                    <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                  </View>
                :
                  null
              }              
              {
                items.nombre_tabla === 'documentacion_legal' ?
                  <View>
                    <Text style={{margin: 10}}>Verificar Documentación legal: </Text>
                    <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>

                    <View style={{flex:1, flexDirection:'row', justifyContent:'space-between', marginBottom: 10}}>
                      <TouchableOpacity onPress={() => this.verImagen(true)}>
                        <Image ref={component => this._img1 = component} style={{width: 50, height: 50}} source={{uri: imgTemp1}}></Image>
                      </TouchableOpacity>
                      <Input placeholder='Documento Vencido' disabled defaultValue={items.documento_vencido !== null ? imgTemp1 : ''} value={this.state.archivo.uri} style={{marginLeft:20, textDecorationLine:'underline'}}></Input>
                    </View>
                    <Button iconLeft regular block info style={[styles.boton]} onPress={() => this.openFilePicker(true)}><Icon ios="ios-search" android="md-search"></Icon><Text>Buscar Imagen</Text></Button>
                    <View style={{flex:1, flexDirection:'row', justifyContent:'space-between', marginBottom: 10, marginTop: 10}}>
                      <TouchableOpacity onPress={() => this.verImagen(false)}>
                        <Image ref={component => this._img2 = component} style={{width: 50, height: 50}} source={{uri: imgTemp2}}></Image>
                      </TouchableOpacity>
                      <Input placeholder='Documento Renovado' disabled defaultValue={items.documento_renovado !== null ? imgTemp2 : ''} value={this.state.archivo2.uri} style={{marginLeft:20, textDecorationLine:'underline'}}></Input>
                    </View>
                    <Button iconLeft regular block info style={[styles.boton]} onPress={() => this.openFilePicker(false)}><Icon ios="ios-search" android="md-search"></Icon><Text>Buscar Imagen</Text></Button>
                  </View>
                :
                  null
              }              
              {
                items.nombre_tabla === 'evaluacion_pedidos' ?
                  <View>
                    <Text style={{margin: 10}}>Pedidos realizados vs Remision: </Text>
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
                    <Text style={{margin: 10}}>Revisar pedidos y excesos: </Text>
                    <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'libro_agendaclientes' ?
                  <View>
                    <Text style={{margin: 10}}>Revisar agenda de clientes: </Text>
                    <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                  </View>
                :
                  null
              }              
              {
                items.nombre_tabla === 'libro_vencimientos' ?
                  <View>
                    <Text style={{margin: 10, fontWeight: 'bold'}}>Confirmar que estén separados los productos del libro de vencimientos: </Text>
                    <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                    <Text style={{margin: 5, fontWeight: 'bold'}}>Productos a vencer: </Text>
                    <Autocomplete
                      autoCapitalize="none"
                      data={prods}
                      defaultValue={query}
                      onChangeText={text => this.BuscarProducto(text)}
                      placeholder="Producto a buscar"
                      renderItem={item => (
                        <TouchableOpacity onPress={() => this.setState({ query: '', PRODUCTS: [...this.state.PRODUCTS, {prod:item,cant:1}] }) }>
                          <Text style={{borderBottomWidth:1, borderBottomColor:'#039BE5'}}>{item}</Text>
                        </TouchableOpacity>
                      )}
                    />
                    <List dataArray={this.state.PRODUCTS}
                      renderRow={(item) =>
                        <View style={{flex:1, flexDirection:'row', justifyContent:'space-between'}}>
                          <View style={{flex:2, justifyContent:'flex-start'}}>
                            <ListItem button onPress={() => this.BorrarProducto(item)}>
                              <Icon ios='ios-trash' android="md-trash" style={{color: '#d9534f', fontSize: 20}}></Icon>
                              <Text style={{marginLeft:3}}>{item.prod}</Text>
                            </ListItem>
                          </View>
                          <View style={{flex:1, justifyContent:'center'}}>
                            <NumericInput rounded minValue={1} maxValue={999} initValue={item.cant} value={item.cant} onChange={value => this.ModificarProducto(item,value)}/>
                          </View>
                        </View>
                      }>
                    </List>                    
                    <Text style={{margin: 5, fontWeight: 'bold'}}>Fecha de Vencimiento: </Text>
                    <DatePicker
                      defaultDate={new Date()}
                      minimumDate={new Date(2019, 0, 1)}
                      locale={"es"}
                      timeZoneOffsetInMinutes={undefined}
                      modalTransparent={false}
                      animationType={"fade"}
                      androidMode={"default"}
                      placeHolderText="Seleccionar Fecha"
                      textStyle={{ color: "green" }}
                      placeHolderTextStyle={{ color: "#d3d3d3" }}
                      onDateChange={this.setDate}
                      disabled={false}
                      />
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'papeleria_consignaciones' ?
                  <View>
                    <Text style={{margin: 10}}>Verificar la papelería: </Text>
                    <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'presupuesto_pedido' ?
                  <View>
                    <Text style={{margin: 10}}>Revisar metodología utilizada para revisar el pedido: </Text>
                    <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'remisiones' ?
                  <View>
                    <Text style={{margin: 10}}>Revisar remisiones grabadas a la fecha: </Text>
                    <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'revision_completa_inventario' ?
                  <View>
                    <Text style={{margin: 10}}>Revision completa de los inventarios: </Text>
                    <RadioButton SetChecked={this.SetChecked} i={1} value={'Completo'} checked={this.state.checked}></RadioButton>
                    <RadioButton SetChecked={this.SetChecked} i={2} value={'Pendiente'} checked={this.state.checked}></RadioButton>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'seguimiento_vendedores' ?
                  <View>
                    <Text style={{margin: 10}}>Revisión del desempeño de cada vendedor: </Text>
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
                      <Text style={{margin: 5, fontWeight: 'bold'}}>Motivo de ausencia: </Text>
                      <Picker
                        mode="dropdown"
                        iosIcon={<Icon name="arrow-down" />}
                        placeholder="Motivo de ausencia"
                        placeholderStyle={{ color: "#bfc6ea" }}
                        placeholderIconColor="#007aff"
                        style={{ width: undefined }}
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
                <Button success regular block style={styles.boton} onPress={() => this.FinishActivity(this.props.handler2)}><Text> Finalizar </Text></Button>
              :              
                <Button info regular block style={styles.boton} onPress={() => this.FinishActivity(this.props.handler2)}><Text> Modificar </Text></Button>
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
          <Text style={{color:'white', textAlign:'justify'}}>{info}</Text>
        </Overlay>
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
      </Container>
    );
  }
}