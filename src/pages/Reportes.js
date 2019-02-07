import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Content, Header, Left, Body, Right, Icon, Button, Spinner,Drawer, Text, Input, Form, Textarea,ListItem } from 'native-base';
import Overlay from 'react-native-modal-overlay';
import Autocomplete from 'react-native-autocomplete-input';
import IconStyles from '../styles/Icons';
import styles from '../styles/Reportes';
import {toastr} from '../components/Toast';
import {api} from '../services/api'
import {View, BackHandler,Image, AsyncStorage,TouchableOpacity, RefreshControl, ScrollView} from 'react-native';
import SideBar from './SideBar';
import { UserInfo } from '../components/UserInfo';
import { COLOR } from '../components/Colores';
import { Imagen } from '../components/Imagenes';

let items = null;
let user = [];
let imgTemp1 = '';
let imgOverlay = '';
export default class Reportes extends Component {
  constructor(props) {
    super(props);
    this.state = {
        archivo: {},
        loading: true,
        refreshing: false,
        showToast: false,
        estado:true,
        asunto:'',
        observacion: '',
        isVisibleReporte: false,
        isVisibleDetalleReporte:false,
        isLoadReporte: false,
        imgReporte: Imagen.noDisponible,
        isVisible2: false,
        disable:false,
        reportes:[],
        SUCURSALES:[],
        suc_nombre:'',
        suc_id:0,
        mensajes:[],
        mensajeInit:{},
        mensaje:''
    };
    let token = this.props.token;
    items = this.props.data;
    imgOverlay = '';
    this._retrieveData = this._retrieveData.bind(this);
    this.closeDrawer = this.closeDrawer.bind(this);
    this._retrieveData();
    console.ignoredYellowBox = ['Require cycle:'];
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
        this.getReportes();
      //this.setState({ loading: false });
    }
    else{this.props.handler2(-1,token,[]);}
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
    this.props.handler2(1,null,[]);
    return true;
  }

  /**
   * Obtener lista de reportes creados
   */
  async getReportes(){
    //ipObtenerReporteSucursal
    //ipHomeGerente
    this.setState({ refreshing: true });
    var that = this;
    let handler2 = false;
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    await fetch(api.ipObtenerReporteSucursal, {
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
      if(response.ok === true && response.status === 200)
      {
        that.setState({reportes: newToken});
        //console.log(newToken);
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
          //toastr.showToast(newToken,'warning');
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
   * Crear reporte con asunto, observaciones e imagen
   */
  async CrearReporte(){
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    let file1 = '';
    let that = this;
    if(this.state.archivo.hasOwnProperty('uri')){
      await Expo.FileSystem.readAsStringAsync(this.state.archivo.uri, {encoding: Expo.FileSystem.EncodingTypes.Base64}).then(function(response){
        file1 = response;
      });
    }
    else{
        file1 = this.state.imgVencido;
    }
    await fetch(api.ipReporteSupervisor, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
        'Accept':'application/json'
      },      
      body: JSON.stringify({
        id_sucursal: this.state.suc_id,
        nombre_sucursal:this.state.suc_nombre,
        nombre_reporte: this.state.asunto,
        foto: file1,
        observaciones: this.state.observacion,
      })
    }).then(function(response) {
      //console.log(response);
      var token2 = JSON.parse(response._bodyInit);
      if(response.ok === true)
      {
        toastr.showToast(token2["message"],'success');
        that.getReportes();
        that.setState({isVisibleReporte:false,isLoadReporte:false,disable:false});
      }
      else{
        toastr.showToast(token2["message"],'warning'); 
        console.log(response);
      }
    }).catch(function(error){
      //toastr.showToast('Su sesión expiró','danger');
      console.log(error);
    });
  }

  /**
   * Obtener detalle de un reporte en especifico
   * @param data datos del reporte seleccionado
   */
  async getDetalleReporte(data){
    this.setState({isVisibleDetalleReporte:true, mensajes:[], mensajeInit:{}})
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    let that = this;
    await fetch(api.ipDetalleRepSucursal, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
        'Accept':'application/json'
      },      
      body: JSON.stringify({
        id_reporte: data.id_reporte
      })
    }).then(function(response) {
      //console.log(response);
      var token2 = JSON.parse(response._bodyInit);
      if(response.ok === true)
      {
        //console.log(token2["detalle"]);
        //console.log(token2["mensajes"]);
        if(token2["detalle"].foto === '' || token2["detalle"].foto === null){
          imgTemp1 = Imagen.noDisponible;
        }
        else{
          imgTemp1 = api.ipImg + token2["detalle"].foto;
        }
        that.setState({mensajes:token2["mensajes"], mensajeInit:token2["detalle"], imgReporte:imgTemp1, isLoadReporte:true});
        //toastr.showToast(token2["detalle"],'success');
      }
      else{
        toastr.showToast(token2["message"],'warning'); 
        console.log(response);
      }
    }).catch(function(error){
      toastr.showToast('Su sesión expiró','danger');
      console.log(error);
    });

  }

  /**
   * Enviar mensaje al coordinador en un reporte especifico
   */
  async EnviarMensaje(){
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    let that = this;
    await fetch(api.ipEnviarMensajeReporte, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
        'Accept':'application/json'
      },      
      body: JSON.stringify({
        id_reporte: this.state.mensajeInit.id_reporte,
        mensaje:this.state.mensaje,
      })
    }).then(function(response) {
      //console.log(response);
      var token2 = JSON.parse(response._bodyInit);
      if(response.ok === true)
      {
        toastr.showToast(token2["message"],'success');
        that.setState({isVisibleDetalleReporte:false,isLoadReporte:false,disable:false});
      }
      else{
        toastr.showToast(token2["message"],'warning'); 
        console.log(response);
      }
    }).catch(function(error){
      //toastr.showToast('Su sesión expiró','danger');
      console.log(error);
    });
  }

  /** buscar Sucursales */
  BuscarSucursales(query){
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    let sucs = [];
    var that = this;
    if(query !== ''){
      fetch(api.ipBuscarSucursales, {
        method: 'POST',
        headers: {
            'Authorization': auth,
            'Content-Type': 'application/json',
            'Accept':'application/json'
        },
        body: JSON.stringify({
          nombre_sucursal: query.toLowerCase()
        })
      }).then(function(response) {
        //console.log(response);
        if(response.ok === true && response.status === 200)
        {
          newToken = JSON.parse(response._bodyInit);
          //console.log(newToken.sucursales['data']);
          Object.values(newToken.sucursales['data']).forEach(element => {
            sucs.push({nombre: element.nombre, id: element.id_suscursal, codigo: element.cod_sucursal});
          });
          //console.log(sucs)
          that.setState({SUCURSALES: sucs,query:query});
        }
        else
        {
          //console.log(response);
          if(response.status === 500){
            toastr.showToast('Error con el servidor','danger');
          }
          else if(response.status === 401){
            toastr.showToast('Su sesión expiró','danger');
          }
          else{
            toastr.showToast('No se encontraron Sucursales','warning');
            that.setState({SUCURSALES: sucs,query:query});
          }
        }
        //return response.json();
      }).catch(function(error){
        toastr.showToast('Su sesión expiró','danger');
        console.log(error);
      });
    }else{this.setState({SUCURSALES: sucs,query:query});}
  }

  /**
   * Seleccionar un archivo desde el UI del dispositivo
   */
  openFilePicker = async () => {
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
        imgTemp1 = attachment.uri;
        this._img1.setNativeProps({src: [{uri: imgTemp1}]});
        this.setState({archivo: attachment, imgReporte: imgTemp1});
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
  verImagen(){
    imgOverlay = this.state.imgReporte;
    this.setState({isVisible2: true});
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
    const { query } = this.state;
    const sucursales = this.state.SUCURSALES;
    return (
      <Drawer
        ref={(ref) => { this.drawer = ref; }}
        content={<SideBar handler={this.props.handler} handler2={this.props.handler2}  layout={8} token={token} data={this.props.data} indexArray={this.props.indexArray} _retrieveData={this._retrieveData} closeDrawer={this.closeDrawer}/>}
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
                    <Icon ios="ios-menu" android="md-menu" style={IconStyles.menu}></Icon>
                    </Button>
                </Left>       
                <Body>
                </Body>
                <Right>
                </Right>
            </Header>
            <UserInfo handler2={this.props.handler2} user={user} estado={this.state.estado}></UserInfo>
            <Content refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={() => this.getReportes()}
                  colors={[COLOR.azul]}
                />
                }>
                <Button success regular block style={[styles.boton, styles.finalizar]} onPress={() => this.setState({imgReporte:Imagen.noDisponible,isVisibleReporte:true})}><Text style={styles.textButton}> Crear Nuevo </Text></Button>
                {
                  this.state.reportes.map((data,index) => {
                    return(
                      <ListItem key={index} button underlayColor={COLOR.azulTransparente} style={styles.SinBorde}>
                        <Left>
                            <View style={styles.ReporteBackground}>
                              <TouchableOpacity style={{width:"100%", height: "100%", justifyContent:'center'}} onPress={() => this.getDetalleReporte(data)}>
                                <Text style={styles.ReporteText}>{data.nombre_reporte}</Text>
                              </TouchableOpacity>
                            </View>
                        </Left>
                        <Right>
                            {
                              data.estado_corregido === 1 &&
                              <View style={{flexDirection:'row'}}>
                                <View style={[styles.estado,{backgroundColor:'transparent', borderColor:COLOR.rojo, borderWidth:1,marginRight:10}]}>
                                  <Image style={styles.iconoBoton} source={Imagen.equis}></Image>
                                </View>
                                <View style={[styles.estado,{backgroundColor:COLOR.rojo}]}>
                                  <Image style={styles.iconoBoton} source={Imagen.uncheck}></Image>
                                </View>
                              </View>
                            }
                            {           
                              data.estado_corregido !== 1 && 
                              <View style={{flexDirection:'row'}}>
                                <View style={[styles.estado,{backgroundColor:'transparent', borderColor:COLOR.rojo, borderWidth:1,marginRight:10}]}>
                                  <Image style={styles.iconoBoton} source={Imagen.equis}></Image>
                                </View>
                                <View style={[styles.estado,{backgroundColor:COLOR.verde}]}>
                                  <Image style={styles.iconoBoton} source={Imagen.check}></Image>
                                </View>
                              </View>
                            }
                        </Right>
                      </ListItem>
                    )
                  })
                }
            </Content>

            <Overlay
                visible={this.state.isVisibleReporte}
                animationType="zoomIn"
                onClose={() => this.setState({isVisibleReporte: false,isLoadReporte:false})}
                containerStyle={{backgroundColor: "rgba(0, 0, 0, .8)", width:"auto",height:"auto"}}
                childrenWrapperStyle={{backgroundColor: "rgba(255, 255, 255, 1)", borderRadius: 10}}
              >
                <View style={{justifyContent:'space-between'}}>
                  <TouchableOpacity style={{marginBottom:10, width:50}} onPress={() => this.setState({isVisibleReporte: false,isLoadReporte:false})}><Image style={styles.iconoBoton} source={Imagen.back}></Image></TouchableOpacity>
                  <ScrollView>
                    <Input style={[styles.asunto,{width:"82%", fontFamily:'BebasNeueBold', marginLeft:20}]} placeholder="Asunto" onChangeText={(text) => this.setState({asunto: text})}></Input>
                    <Autocomplete
                        autoCapitalize="none"
                        data={sucursales}
                        defaultValue={query}
                        onChangeText={text => this.BuscarSucursales(text)}
                        placeholder="Sucursal"
                        inputContainerStyle={styles.autocompletar}
                        listStyle={styles.autocompletarLista}
                        renderItem={item => (
                          <TouchableOpacity onPress={() => {this.setState({suc_nombre: item.nombre, suc_id: item.id, query: item.nombre}); this.BuscarSucursales(item.nombre)} }>
                            <Text style={styles.producto}> {item.nombre}</Text>
                          </TouchableOpacity>
                        )}
                      />
                    <Form>
                        <Textarea bordered placeholder="Observaciones" style={[styles.observaciones,{marginTop:0, height:100}]} onChangeText={(text) => this.setState({observacion: text})} />
                    </Form>
                    <TouchableOpacity onPress={() => this.verImagen()} style={{width:64, alignSelf:'center',marginBottom:10}}>
                      <Image ref={component => this._img1 = component} style={{width: 50, height: 50}} source={{uri: this.state.isVisibleReporte ? this.state.imgReporte : Imagen.noDisponible}}></Image>
                    </TouchableOpacity>
                    <Button regular block info style={[styles.boton, styles.actualizar,{marginBottom:0}]} onPress={() => this.openFilePicker()}><Text>Cargar Imagen</Text></Button>
                    <Button disabled={this.state.disable} success regular block style={[styles.boton, styles.finalizar, {marginTop:10}]} onPress={() => {this.setState({disable:true}); this.CrearReporte()}}><Text> Enviar </Text></Button>
                  </ScrollView>
                </View>
            </Overlay>

            <Overlay
                visible={this.state.isVisibleDetalleReporte}
                animationType="zoomIn"
                onClose={() => this.setState({isVisibleDetalleReporte: false,isLoadReporte:false})}
                containerStyle={{backgroundColor: "rgba(0, 0, 0, .8)", width:"auto",height:"auto"}}
                childrenWrapperStyle={{backgroundColor: "rgba(255, 255, 255, 1)", borderRadius: 10}}
              >
              {
                /***
                * Mostrar layout luego de cargar los datos
                */
                !this.state.isLoadReporte && this.state.isVisibleDetalleReporte?
                  <View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color='blue' /></View>
                :
                  <View style={{justifyContent:'space-between'}}>
                    <TouchableOpacity style={{marginBottom:10, width:50}} onPress={() => this.setState({isVisibleDetalleReporte: false,isLoadReporte:false})}><Image style={styles.iconoBoton} source={Imagen.back}></Image></TouchableOpacity>
                    <ScrollView>                    
                      {
                        this.state.mensajeInit.hasOwnProperty('nombre_sucursal') ?
                          <ListItem key={Math.floor(Math.random() * 200) + 201} thumbnail style={{backgroundColor:COLOR.verde70, borderRadius:10,marginBottom:10, marginLeft:0}}>
                            <Left style={{flexDirection:'column'}}>
                              <Text style={{color:'white', fontSize:12, paddingTop:5, paddingLeft:5}}>{this.state.mensajeInit.nombre} {this.state.mensajeInit.apellido}</Text>
                                <TouchableOpacity onPress={() => this.verImagen()}>
                                    <Image ref={component => this._img1 = component} style={{width: 50, height: 50, marginLeft:5,marginBottom:10}} source={{uri: this.state.isVisibleDetalleReporte ? (this.state.mensajeInit.foto !== null? api.ipImg + this.state.mensajeInit.foto : Imagen.noDisponible) : Imagen.noDisponible}}></Image>
                                </TouchableOpacity>
                            </Left>
                            <Body style={{borderBottomColor: 'rgba(255,255,255,0)', paddingBottom:5, paddingTop:0,marginLeft:7}}>
                                <Text style={{color:'white', textAlign:'justify', marginBottom:5}}>{this.state.mensajeInit.nombre_reporte}</Text>
                                <Text style={{color:'white', textAlign:'justify', fontSize:14, paddingLeft:10}}>{this.state.mensajeInit.observaciones}</Text>
                            </Body>
                          </ListItem>
                        : null
                      }
                      {
                        this.state.mensajeInit.hasOwnProperty('nombre_sucursal') ?
                          this.state.mensajes.map((data,index) => {
                            return(
                            data.tipo_usuario === 1 ?
                                <ListItem key={index*1000} thumbnail style={{backgroundColor:COLOR.azul70, borderRadius:10, marginRight:60,marginBottom:10, marginLeft:0}}>
                                  <Body style={{borderBottomColor: 'rgba(255,255,255,0)', paddingBottom:5, paddingTop:5, marginLeft:5}}>
                                    <Text style={{color:'white', fontSize:12,alignSelf:'flex-start'}}>{data.nombre_usuario}</Text>
                                    <Text style={{color:'white', textAlign:'justify', paddingLeft:5}}>{data.mensaje}</Text>
                                    <Text style={{color:'white', fontSize:12, marginRight:12, textAlign:'right'}}>{data.fecha}</Text>
                                  </Body>
                              </ListItem>
                            :
                              <ListItem key={index*1000} thumbnail style={{backgroundColor:COLOR.verde70, borderRadius:10, marginLeft:60,marginBottom:10}}>
                                <Body style={{borderBottomColor: 'rgba(255,255,255,0)', paddingBottom:5, paddingTop:5, marginLeft:5}}>
                                  <Text style={{color:'white', fontSize:12,alignSelf:'flex-start'}}>{data.nombre_usuario}</Text>
                                  <Text style={{color:'white', textAlign:'justify', paddingLeft:5}}>{data.mensaje}</Text>
                                  <Text style={{color:'white', fontSize:12, marginRight:12, textAlign:'right'}}>{data.fecha}</Text>
                                </Body>
                              </ListItem>
                            )
                          })
                        : null
                      }
                      <Input style={[styles.asunto,{width:230}]} placeholder="Mensaje"  onChangeText={(text) => this.setState({mensaje: text})}></Input>
                      <Button disabled={this.state.disable} success regular block style={[styles.boton, styles.finalizar, {marginTop:10}]} onPress={() => {this.setState({disable:true}); this.EnviarMensaje()}}><Text> Enviar Mensaje </Text></Button>
                    </ScrollView>
                  </View>
              }
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
      </Drawer>
    );
  }
}