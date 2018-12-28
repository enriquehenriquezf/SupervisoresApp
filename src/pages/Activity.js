import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, Text, Icon, Button, Spinner, Textarea, Form, ListItem, Radio, H2, Card, Input } from 'native-base';
import {toastr} from '../components/Toast';
import {View,Platform, BackHandler, KeyboardAvoidingView, AsyncStorage, CameraRoll, Image, ScrollView} from 'react-native';
import Overlay from 'react-native-modal-overlay';
import styles from '../styles/Activity';
import IconStyles from '../styles/Icons';
import {api} from '../services/api'

let items = null;
let info = '';
let time = 0;
let timeInit = 0;
export default class Activity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      checked: 1 ,
      calificacion_pv: 'Puntual',
      observacion: '',
      latitude: null,
      longitude: null,
      error:null,
      isVisible: false,
      isVisible2: false,
      photos: [],
      showToast: false
    };
    let token = this.props.token;
    items = this.props.data;
    time = 0;
    timeInit = new Date().getTime();
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
    this._retrieveData();
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
          'Content-Type': 'application/x-www-form-urlencoded'
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
    this.setState({observacion: items.observacion});
    
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
  FinishActivity(handler)
  {
    let bodyInit = JSON.parse(token._bodyInit);
    let handler2 = this.props.handler2;
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    let id = items.id_actividad;
    this._storeData();
    fetch(api.ipActivity, {
      method: 'POST',
      headers: {
          'Authorization': auth,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        calificacion_pv: this.state.calificacion_pv, 
        nombre_tabla: items.nombre_tabla,
        id_plan_trabajo: items.id_plan_trabajo, 
        id_actividad: id,
        observaciones: this.state.observacion
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
        toastr.showToast(newToken[message],'warning');
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
      console.log("tiempo: " + time);
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
   * Obtener datos de tiempo actual del plan de trabajo
   */
  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('TIME_' + items.nombre_tabla + '_' + items.id_actividad);
      if (value !== null) {
        time = value;
        //console.log(time);
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Mostrar las imagenes de la galeria
   */
  getFile(){
    CameraRoll.getPhotos({
      first: 20,
      assetType: 'All',
    })
    .then(r => {
      this.setState({ photos: r.edges, isVisible2:true });
    })
    .catch((err) => {
      console.log(err);
    });
  }

  /**
   * Subir imagen al servidor
   */
  subirImagen(image){
    console.log(image);
    this.setState({isVisible2: false});
  }
  //TODO: Expo DocumentPicker
  /*openFilePicker = async () => {
    let file = await DocumentPicker.getDocumentAsync();

    if (file.type == "success") { // user has selected a file if type is success
      this.attachment = {
        name: file.name,
        uri: file.uri,
        type: "file",
        file_type: mime.contentType(file.name) // get mime type
      };

      Alert.alert("Success", "File attached!");
    }
  }*/

  render() {
    /***
     * Mostrar layout luego de cargar los datos
     */
    if (this.state.loading) {
      return (<View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color='blue' /></View>);
    }
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
                    <ListItem button onPress={() => this.SetChecked(1,'Puntual')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Puntual</Text>
                      </Left>
                      <Right>                    
                        {
                          this.state.checked === 1 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(1,'Puntual')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(1,'Puntual')} />
                        }
                      </Right>
                    </ListItem>       
                    <ListItem button onPress={() => this.SetChecked(2,'Tarde')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Tarde</Text>
                      </Left>
                      <Right>
                        {
                          this.state.checked === 2 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(2,'Tarde')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(2,'Tarde')} />
                        }
                      </Right>
                    </ListItem>
                    <ListItem button onPress={() => this.SetChecked(3,'Muy Tarde')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Muy Tarde</Text>
                      </Left>
                      <Right>                    
                        {
                          this.state.checked === 3 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(3,'Muy Tarde')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(3,'Muy Tarde')} />
                        }
                      </Right>
                    </ListItem>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'kardex' ?
                  <View>
                    <Text style={{margin: 10}}>Elaboración: </Text>              
                    <ListItem button onPress={() => this.SetChecked(1,'Completo')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Completo</Text>
                      </Left>
                      <Right>
                        {
                          this.state.checked === 1 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(1,'Completo')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(1,'Completo')} />
                        }
                      </Right>
                    </ListItem>
                    <ListItem button onPress={() => this.SetChecked(2,'Pendiente')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Pendiente</Text>
                      </Left>
                      <Right>                    
                        {
                          this.state.checked === 2 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(2,'Pendiente')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(2,'Pendiente')} />
                        }
                      </Right>
                    </ListItem>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'condiciones_locativas' ?
                  <View>
                    <Text style={{margin: 10}}>Condiciones: </Text>              
                    <ListItem button onPress={() => this.SetChecked(1,'Excelentes')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Excelentes</Text>
                      </Left>
                      <Right>
                        {
                          this.state.checked === 1 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(1,'Excelentes')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(1,'Excelentes')} />
                        }
                      </Right>
                    </ListItem>
                    <ListItem button onPress={() => this.SetChecked(2,'Buenas')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Buenas</Text>
                      </Left>
                      <Right>                    
                        {
                          this.state.checked === 2 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(2,'Buenas')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(2,'Buenas')} />
                        }
                      </Right>
                    </ListItem>
                    <ListItem button onPress={() => this.SetChecked(3,'Regulares')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Regulares</Text>
                      </Left>
                      <Right>                    
                        {
                          this.state.checked === 3 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(3,'Regulares')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(3,'Regulares')} />
                        }
                      </Right>
                    </ListItem>
                    <ListItem button onPress={() => this.SetChecked(4,'Malas')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Malas</Text>
                      </Left>
                      <Right>                    
                        {
                          this.state.checked === 4 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(4,'Malas')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(4,'Malas')} />
                        }
                      </Right>
                    </ListItem>
                    <ListItem button onPress={() => this.SetChecked(5,'Pesimas')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Pesimas</Text>
                      </Left>
                      <Right>                    
                        {
                          this.state.checked === 5 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(5,'Pesimas')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(5,'Pesimas')} />
                        }
                      </Right>
                    </ListItem>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'convenio_exhibicion' ?
                  <View>
                    <Text style={{margin: 10}}>Verificar permanencia de las exhibiciones: </Text>              
                    <ListItem button onPress={() => this.SetChecked(1,'Completo')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Completo</Text>
                      </Left>
                      <Right>
                        {
                          this.state.checked === 1 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(1,'Completo')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(1,'Completo')} />
                        }
                      </Right>
                    </ListItem>
                    <ListItem button onPress={() => this.SetChecked(2,'Pendiente')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Pendiente</Text>
                      </Left>
                      <Right>                    
                        {
                          this.state.checked === 2 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(2,'Pendiente')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(2,'Pendiente')} />
                        }
                      </Right>
                    </ListItem>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'libros_faltantes' ?
                  <View>
                    <Text style={{margin: 10}}>Verificar libros faltantes a la fecha: </Text>              
                    <ListItem button onPress={() => this.SetChecked(1,'Al día')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Al día</Text>
                      </Left>
                      <Right>
                        {
                          this.state.checked === 1 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(1,'Al día')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(1,'Al día')} />
                        }
                      </Right>
                    </ListItem>
                    <ListItem button onPress={() => this.SetChecked(2,'Pendiente')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Pendiente</Text>
                      </Left>
                      <Right>                    
                        {
                          this.state.checked === 2 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(2,'Pendiente')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(2,'Pendiente')} />
                        }
                      </Right>
                    </ListItem>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'ingreso_sucursal' ?
                  <View>
                    <Text style={{margin: 10}}>Reporte de ingreso: </Text>              
                    <ListItem button onPress={() => this.SetChecked(1,'Al día')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Al día</Text>
                      </Left>
                      <Right>
                        {
                          this.state.checked === 1 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(1,'Al día')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(1,'Al día')} />
                        }
                      </Right>
                    </ListItem>
                    <ListItem button onPress={() => this.SetChecked(2,'Pendiente')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Pendiente</Text>
                      </Left>
                      <Right>                    
                        {
                          this.state.checked === 2 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(2,'Pendiente')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(2,'Pendiente')} />
                        }
                      </Right>
                    </ListItem>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'formulas_despacho' ?
                  <View>
                    <Text style={{margin: 10}}>Reporte de ingreso: </Text>              
                    <ListItem button onPress={() => this.SetChecked(1,'Completo')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Completo</Text>
                      </Left>
                      <Right>
                        {
                          this.state.checked === 1 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(1,'Completo')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(1,'Completo')} />
                        }
                      </Right>
                    </ListItem>
                    <ListItem button onPress={() => this.SetChecked(2,'Pendiente')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Pendiente</Text>
                      </Left>
                      <Right>                    
                        {
                          this.state.checked === 2 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(2,'Pendiente')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(2,'Pendiente')} />
                        }
                      </Right>
                    </ListItem>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'captura_cliente' ?
                  <View>
                    <Text style={{margin: 10}}>Captación de clientes: </Text>              
                    <ListItem button onPress={() => this.SetChecked(1,'Completo')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Completo</Text>
                      </Left>
                      <Right>
                        {
                          this.state.checked === 1 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(1,'Completo')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(1,'Completo')} />
                        }
                      </Right>
                    </ListItem>
                    <ListItem button onPress={() => this.SetChecked(2,'Pendiente')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Pendiente</Text>
                      </Left>
                      <Right>                    
                        {
                          this.state.checked === 2 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(2,'Pendiente')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(2,'Pendiente')} />
                        }
                      </Right>
                    </ListItem>
                  </View>
                :
                  null
              }              
              {
                items.nombre_tabla === 'documentacion_legal' ?
                  <View>
                    <Text style={{margin: 10}}>Verificar Documentación legal: </Text>              
                    <ListItem button onPress={() => this.SetChecked(1,'Completo')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Completo</Text>
                      </Left>
                      <Right>
                        {
                          this.state.checked === 1 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(1,'Completo')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(1,'Completo')} />
                        }
                      </Right>
                    </ListItem>
                    <ListItem button onPress={() => this.SetChecked(2,'Pendiente')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Pendiente</Text>
                      </Left>
                      <Right>                    
                        {
                          this.state.checked === 2 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(2,'Pendiente')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(2,'Pendiente')} />
                        }
                      </Right>
                    </ListItem>
                    <Button info regular block style={styles.boton} onPress={() => this.getFile()}><Text> Subir Imagen </Text></Button>
                  </View>
                :
                  null
              }              
              {
                items.nombre_tabla === 'evaluacion_pedidos' ?
                  <View>
                    <Text style={{margin: 10}}>Pedidos realizados vs Remision: </Text>              
                    <ListItem button onPress={() => this.SetChecked(1,'Completo')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Completo</Text>
                      </Left>
                      <Right>
                        {
                          this.state.checked === 1 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(1,'Completo')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(1,'Completo')} />
                        }
                      </Right>
                    </ListItem>
                    <ListItem button onPress={() => this.SetChecked(2,'Pendiente')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Pendiente</Text>
                      </Left>
                      <Right>                    
                        {
                          this.state.checked === 2 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(2,'Pendiente')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(2,'Pendiente')} />
                        }
                      </Right>
                    </ListItem>
                    <Input placeholder="Número revisión"></Input>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'excesos' ?
                  <View>
                    <Text style={{margin: 10}}>Revisar pedidos y excesos: </Text>              
                    <ListItem button onPress={() => this.SetChecked(1,'Completo')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Completo</Text>
                      </Left>
                      <Right>
                        {
                          this.state.checked === 1 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(1,'Completo')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(1,'Completo')} />
                        }
                      </Right>
                    </ListItem>
                    <ListItem button onPress={() => this.SetChecked(2,'Pendiente')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Pendiente</Text>
                      </Left>
                      <Right>                    
                        {
                          this.state.checked === 2 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(2,'Pendiente')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(2,'Pendiente')} />
                        }
                      </Right>
                    </ListItem>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'libro_agendaclientes' ?
                  <View>
                    <Text style={{margin: 10}}>Revisar agenda de clientes: </Text>              
                    <ListItem button onPress={() => this.SetChecked(1,'Completo')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Completo</Text>
                      </Left>
                      <Right>
                        {
                          this.state.checked === 1 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(1,'Completo')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(1,'Completo')} />
                        }
                      </Right>
                    </ListItem>
                    <ListItem button onPress={() => this.SetChecked(2,'Pendiente')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Pendiente</Text>
                      </Left>
                      <Right>                    
                        {
                          this.state.checked === 2 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(2,'Pendiente')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(2,'Pendiente')} />
                        }
                      </Right>
                    </ListItem>
                  </View>
                :
                  null
              }              
              {
                items.nombre_tabla === 'libro_vencimientos' ?
                  <View>
                    <Text style={{margin: 10}}>Revisar libro de vencimientos: </Text>              
                    <ListItem button onPress={() => this.SetChecked(1,'Completo')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Completo</Text>
                      </Left>
                      <Right>
                        {
                          this.state.checked === 1 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(1,'Completo')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(1,'Completo')} />
                        }
                      </Right>
                    </ListItem>
                    <ListItem button onPress={() => this.SetChecked(2,'Pendiente')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Pendiente</Text>
                      </Left>
                      <Right>                    
                        {
                          this.state.checked === 2 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(2,'Pendiente')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(2,'Pendiente')} />
                        }
                      </Right>
                    </ListItem>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'papeleria_consignaciones' ?
                  <View>
                    <Text style={{margin: 10}}>Verificar la papelería: </Text>              
                    <ListItem button onPress={() => this.SetChecked(1,'Completo')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Completo</Text>
                      </Left>
                      <Right>
                        {
                          this.state.checked === 1 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(1,'Completo')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(1,'Completo')} />
                        }
                      </Right>
                    </ListItem>
                    <ListItem button onPress={() => this.SetChecked(2,'Pendiente')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Pendiente</Text>
                      </Left>
                      <Right>                    
                        {
                          this.state.checked === 2 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(2,'Pendiente')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(2,'Pendiente')} />
                        }
                      </Right>
                    </ListItem>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'presupuesto_pedido' ?
                  <View>
                    <Text style={{margin: 10}}>Revisar metodología utilizada para revisar el pedido: </Text>              
                    <ListItem button onPress={() => this.SetChecked(1,'Completo')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Completo</Text>
                      </Left>
                      <Right>
                        {
                          this.state.checked === 1 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(1,'Completo')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(1,'Completo')} />
                        }
                      </Right>
                    </ListItem>
                    <ListItem button onPress={() => this.SetChecked(2,'Pendiente')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Pendiente</Text>
                      </Left>
                      <Right>                    
                        {
                          this.state.checked === 2 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(2,'Pendiente')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(2,'Pendiente')} />
                        }
                      </Right>
                    </ListItem>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'remisiones' ?
                  <View>
                    <Text style={{margin: 10}}>Revisar remisiones grabadas a la fecha: </Text>              
                    <ListItem button onPress={() => this.SetChecked(1,'Completo')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Completo</Text>
                      </Left>
                      <Right>
                        {
                          this.state.checked === 1 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(1,'Completo')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(1,'Completo')} />
                        }
                      </Right>
                    </ListItem>
                    <ListItem button onPress={() => this.SetChecked(2,'Pendiente')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Pendiente</Text>
                      </Left>
                      <Right>                    
                        {
                          this.state.checked === 2 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(2,'Pendiente')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(2,'Pendiente')} />
                        }
                      </Right>
                    </ListItem>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'revision_completa_inventario' ?
                  <View>
                    <Text style={{margin: 10}}>Revision completa de los inventarios: </Text>              
                    <ListItem button onPress={() => this.SetChecked(1,'Completo')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Completo</Text>
                      </Left>
                      <Right>
                        {
                          this.state.checked === 1 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(1,'Completo')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(1,'Completo')} />
                        }
                      </Right>
                    </ListItem>
                    <ListItem button onPress={() => this.SetChecked(2,'Pendiente')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Pendiente</Text>
                      </Left>
                      <Right>                    
                        {
                          this.state.checked === 2 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(2,'Pendiente')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(2,'Pendiente')} />
                        }
                      </Right>
                    </ListItem>
                  </View>
                :
                  null
              }
              {
                items.nombre_tabla === 'seguimiento_vendedores' ?
                  <View>
                    <Text style={{margin: 10}}>Revisión del desempeño de cada vendedor: </Text>              
                    <ListItem button onPress={() => this.SetChecked(1,'Completo')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Completo</Text>
                      </Left>
                      <Right>
                        {
                          this.state.checked === 1 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(1,'Completo')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(1,'Completo')} />
                        }
                      </Right>
                    </ListItem>
                    <ListItem button onPress={() => this.SetChecked(2,'Pendiente')} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                      <Left>
                        <Text>Pendiente</Text>
                      </Left>
                      <Right>                    
                        {
                          this.state.checked === 2 ?                        
                            <Radio selected={true} onPress={() => this.SetChecked(2,'Pendiente')}/>
                          :
                            <Radio selected={false} onPress={() => this.SetChecked(2,'Pendiente')} />
                        }
                      </Right>
                    </ListItem>
                  </View>
                :
                  null
              }
              <Form>
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
          <Text style={{color:'white'}}>{info}</Text>
        </Overlay>
        <Overlay
          visible={this.state.isVisible2} 
          animationType="zoomIn"
          onClose={() => this.setState({isVisible2: false})}
          containerStyle={{backgroundColor: "rgba(0, 0, 0, .7)", width:"auto",height:"auto"}}
          childrenWrapperStyle={{backgroundColor: "rgba(0, 0, 0, .5)", borderRadius: 10}}
        >
          <ScrollView>
            {this.state.photos.map((p, i) => {
              return (
                <ListItem key={i} button onPress={() => this.subirImagen(p.node)} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                  <Image
                    key={i}
                    style={{
                      width: 200,
                      height: 200,
                    }}
                    source={{ uri: p.node.image.uri }}
                  />
                </ListItem>
              );
            })}
          </ScrollView>
          <Button success regular block style={[styles.boton, {marginTop:10}]} onPress={() => this.setState({isVisible2:false})}><Text> Cerrar </Text></Button>
        </Overlay>
      </Container>
    );
  }
}