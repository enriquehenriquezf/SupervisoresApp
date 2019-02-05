import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Content, Header, Left, Body, Right, Icon, Button, Spinner,Drawer, Card, Text, Input, Form, Textarea,ListItem } from 'native-base';
import Overlay from 'react-native-modal-overlay';
import IconStyles from '../styles/Icons';
import styles from '../styles/Reportes';
import {toastr} from '../components/Toast';
import {api} from '../services/api'
import {View, BackHandler,Image, AsyncStorage,TouchableOpacity, RefreshControl} from 'react-native';
import SideBar from './SideBar';
import { UserInfo } from '../components/UserInfo';
import { COLOR } from '../components/Colores';
import { Imagen } from '../components/Imagenes';
import { DIMENSIONS } from 'react-native-numeric-input';

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
        isLoadReporte: false,
        imgReporte: Imagen.noDisponible,
        isVisible2: false,
        disable:false,
        reportes:[],
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
        id_sucursal: 294,//FIXME: poner dinamico
        nombre_sucursal:'BOTICA 02',//FIXME: poner dinamico
        nombre_reporte: this.state.asunto,
        foto: file1,
        observaciones: this.state.observacion,
      })
    }).then(function(response) {
      console.log(response);
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
    this.getReportes();
    this.setState({isVisibleReporte:false})
  }

  getDetalleReporte(){
      //ipDetalleRepSucursal
    //this.setState({isVisibleReporte:true})
    toastr.showToast("En Desarrollo!",'warning');

  }

  EnviarMensaje(){
      //ipEnviarMensajeReporte
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
                <Button success regular block style={[styles.boton, styles.finalizar]} onPress={() => this.setState({isVisibleReporte:true})}><Text style={styles.textButton}> Crear Nuevo </Text></Button>
                {
                    this.state.reportes.map((data,index) => {
                        return(
                            <ListItem key={Math.floor(Math.random() * 1000) + 1001} button underlayColor={COLOR.azulTransparente} onPress={() => this.getDetalleReporte()} style={styles.SinBorde}>
                                <Left >
                                    <View style={styles.ReporteBackground}>
                                        <Text style={styles.ReporteText}>{data.nombre_reporte}</Text>
                                    </View>
                                </Left>
                                <Right>
                                    {
                                        data.estado_corregido === 1 &&
                                        <View style={{flexDirection:'row'}}>
                                            <View style={[styles.estado,{backgroundColor:'rgba(0,0,0,0.1)', borderColor:COLOR.rojo, borderWidth:1,marginRight:10}]}>
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
                    <Input style={[styles.asunto,{width:250}]} placeholder="Asunto"  onChangeText={(text) => this.setState({asunto: text})}></Input>                      
                    <Form>
                        <Textarea bordered placeholder="Observaciones" style={[styles.observaciones,{marginTop:0}]} onChangeText={(text) => this.setState({observacion: text})} />
                    </Form>
                    <ListItem thumbnail style={{marginLeft:0}}>
                        <Left>
                            <TouchableOpacity onPress={() => this.verImagen()}>
                                <Image ref={component => this._img1 = component} style={{width: 50, height: 50}} source={{uri: this.state.isVisibleReporte ? this.state.imgReporte : Imagen.noDisponible}}></Image>
                            </TouchableOpacity>
                        </Left>
                        <Body style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                            <Button iconLeft regular block info style={[styles.boton, styles.actualizar,{marginLeft:0,marginRight:0,marginBottom:0}]} onPress={() => this.openFilePicker()}><Image style={styles.iconoBoton} source={Imagen.find}></Image><Text>Cargar Imagen</Text></Button>
                        </Body>
                    </ListItem>
                    <Button disabled={this.state.disable} success regular block style={[styles.boton, styles.finalizar, {marginTop:10}]} onPress={() => {this.setState({disable:true}); this.CrearReporte()}}><Text> Enviar </Text></Button>
                </View>
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