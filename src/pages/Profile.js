import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, Text, Icon, Button, Spinner, H2, Item, Thumbnail, Drawer } from 'native-base';
import styles from '../styles/Profile';
import IconStyles from '../styles/Icons';
import {toastr} from '../components/Toast';
import {api} from '../services/api';
import {Imagen} from '../components/Imagenes';
import {View, BackHandler, Image} from 'react-native';
import SideBar from './SideBar';
import { COLOR } from '../components/Colores';
import Overlay from 'react-native-modal-overlay';

/*var BUTTONS = [
  { text: "Activo", icon: "checkmark-circle", iconColor: "#5cb85c" },
  { text: "Inactivo", icon: "remove-circle", iconColor: "#d9534f" },
  { text: "Cerrar", icon: "close-circle", iconColor: "#fa213b" }
];
var CANCEL_INDEX = 2;*/
let items = null;
export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      loading2:false,
      isVisibleTutorial:false,
      tutorial:'0',
      tuto: [Imagen.tuto1,Imagen.tuto2,Imagen.tuto1],
      showToast: false,
      estado : true
    };
    let token = this.props.token;
    items = this.props.data;
    //this._retrieveData();
    this.ChangePass = this.ChangePass.bind(this);
    this.closeDrawer = this.closeDrawer.bind(this);
    console.ignoredYellowBox = ['Require cycle:'];
  }

  async componentWillMount() {
    //console.log(items);
    if(items.length === 0){this.getProfile()}
    else{this.setState({ loading: false });}
    
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
    this.props.handler2(1,token,[]);
    return true;
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
        items = newToken;
      }
      else
      {
        console.log(response);
        if(response.status === 500){
          toastr.showToast('Error con el servidor','danger');
        }
        else if(response.status === 401){
          toastr.showToast('Su sesión expiró','danger');
          items = {};
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

  /**
   * Enviar correo de cambio de contraseña e ir al layout de cambio de contraseña
   */
  ChangePass(handler)
  {
    this.setState({loading2:true});
    var that = this;
    fetch(api.ipChangePassword, {
      method: 'POST',
      headers: {
          'Authorization': 'Access',
          'Content-Type': 'application/json',
          'Accept':'application/json'
      },
      body: JSON.stringify({email: items.correo})
      }).then(function(response) {
        console.log(response);
        if(response.ok === true)
        {
          toastr.showToast(JSON.parse(response._bodyInit),'success');
          that.setState({loading2:false})
          handler(6,token,items);
        }
        else
        {
          console.log(response);
          that.setState({loading2:false})
          if(response.status === 500){
            toastr.showToast('Error con el servidor','danger');
          }
          else{
            toastr.showToast('Error al enviar el correo','danger');
          }
        }
        //return response.json();
      }).catch(function(error){
        console.log(error);
        that.setState({loading2:false})
      });
  }

  /**
   * Guardar estado del supervisor (Activo/Inactivo)
   */
  /*_storeData = async (estado2) => {
    try {
      var state = '';
      this.setState({estado: estado2});
      var time =  new Date().getTime().toString();
      if(estado2){
        state = 'true';
        await AsyncStorage.multiSet([['ESTADO', state],['TIME_INACTIVO',time]]);
      }else{
        state='false';
        await AsyncStorage.multiSet([['ESTADO', state],['TIME_INACTIVO_INIT',time]]);
        await AsyncStorage.removeItem('TIME_INACTIVO');
      }
    } catch (error) {
      console.log(error);
    }
  }*/

  /**
   * Obtener Estado del supervisor
   */
  /*_retrieveData = async () => {
    try {
      const value = await AsyncStorage.multiGet(['ESTADO','TIME_INACTIVO','TIME_INACTIVO_INIT']);
      var state;
      if (value !== null) {
        if(value[0][1] === 'true'){state=true}
        else{state=false}
        this.setState({estado: state});
        //console.log('TIME_INACTIVO: ' + value[1][1]);
        //console.log('TIME_INACTIVO_INIT: ' + value[2][1]);
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Cambia el estado de Activo o Inactivo
   */
  /*CambiarEstado(){
    ActionSheet.show(
      {
        options: BUTTONS,
        cancelButtonIndex: CANCEL_INDEX,
        title: "Estado"
      },
      buttonIndex => {
        var state;
        if(buttonIndex !== 2){
          if(buttonIndex === 0){
            state = true;
          }
          else if(buttonIndex === 1){state = false;}
          //this.setState({ estado: state });
          if(this.state.estado !== state){
            this._storeData(state);
          }   
        }
      }
    );
  }*/

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
        content={<SideBar handler={this.props.handler} handler2={this.props.handler2}  layout={5} rol={items.id_rol} token={token} data={this.props.data} indexArray={this.props.indexArray} _retrieveData={this._retrieveData} closeDrawer={this.closeDrawer}/>}
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
              {/*<Button transparent style={IconStyles.back} onPress={() => this.props.handler2(1,token,[])}>
                <Icon ios="ios-arrow-back" android="md-arrow-back" style={IconStyles.header}></Icon>
              </Button>*/}
            </Left>       
            <Body>
              {/*<Title>Perfil</Title>*/}
            </Body>
            <Right>
              {/*
                this.state.estado === true ?
                  <TouchableHighlight onPress={() => this.CambiarEstado()}>
                    <View style={IconStyles.estado}>
                      <Icon active ios='ios-checkmark-circle' android='md-checkmark-circle' style={IconStyles.activo}/>
                      <Title style={IconStyles.StateTitle}>Activo</Title>
                      <Icon active ios='ios-arrow-dropdown' android='md-arrow-dropdown' style={IconStyles.dropdown}/>
                    </View>
                  </TouchableHighlight>
                :
                  <TouchableHighlight onPress={() => this.CambiarEstado()}>
                    <View style={IconStyles.estado}>
                      <Icon active ios='ios-remove-circle' android='md-remove-circle' style={IconStyles.inactivo}/>
                      <Title style={IconStyles.StateTitle}>Inactivo</Title>
                      <Icon active ios='ios-arrow-dropdown' android='md-arrow-dropdown' style={IconStyles.dropdown}/>
                    </View>
                  </TouchableHighlight>
              */}
            </Right>
          </Header>
            <Content>
              <View style={{marginTop: 10, marginLeft:'auto', marginRight:'auto'}}>
                  {/* <Thumbnail square large source={Imagen.profileBorder} style={{width:160, height:160}}/> */}
                  <Thumbnail large
                  source={{uri: items.foto}}
                  style={styles.foto}
                  />
                  <H2 style={styles.textH2}>{items.nombre} {items.apellido}</H2>
                  <Item style={styles.item}>
                      {/* <Icon ios="ios-card" android="md-card" style={{color: '#039BE5'}}></Icon> */}
                      <Image source={Imagen.user} style={styles.icono}></Image>
                      <Text style={styles.text}>{items.cedula}</Text>
                  </Item>
                  <Item style={styles.item}>
                      <Image source={Imagen.code} style={styles.icono}></Image>
                      <Text style={styles.text}>{items.codigo}</Text>
                  </Item>
                  <Item style={styles.item}>
                      <Image source={Imagen.mail} style={styles.icono}></Image>
                      <Text style={styles.text}>{items.correo}</Text>
                  </Item>
                  <Item style={styles.item}>
                      <Image source={Imagen.phone} style={styles.icono}></Image>
                      <Text style={styles.text}>{items.telefono}</Text>
                  </Item>
                  <Button info regular block style={styles.boton} onPress={() => this.ChangePass(this.props.handler2)}><Text style={styles.textoBoton}> Cambiar Contraseña </Text></Button>
                  <Button info regular block style={[styles.boton,{backgroundColor:COLOR.completado50}]} onPress={() => this.setState({tutorial:'0',isVisibleTutorial:true})}><Text style={styles.textoBoton}> Ver Tutorial </Text></Button>
              </View>
            </Content>
            <Overlay
              visible={this.state.isVisibleTutorial}
              animationType="zoomIn"
              closeOnTouchOutside={false}
              onClose={() => this.setState({isVisibleTutorial: true})}
              containerStyle={{backgroundColor: "rgba(0, 0, 0, .8)", width:"auto",height:"auto"}}
              childrenWrapperStyle={{backgroundColor: "rgba(0,0,0, .5)", borderRadius: 10,padding:10,paddingTop:20,paddingBottom:20}}
            >
              <View style={{justifyContent:'space-between', width:"100%"}}>
                <Image style={{width:300,height:500}} source={this.state.tuto[this.state.tutorial]}/>
                <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                  <Button disabled={this.state.tutorial !== '2'} style={{backgroundColor:this.state.tutorial === '2'?COLOR.verde:COLOR.gris,alignSelf:'center'}} onPress={() => {this.setState({isVisibleTutorial: false})} }>
                    <Text style={{fontFamily:'BebasNeueBold', fontSize:20}}>Aceptar</Text>
                  </Button>
                  <Button disabled={this.state.tutorial <= '0'} style={{backgroundColor:this.state.tutorial > '0'?COLOR.azul:COLOR.gris,alignSelf:'flex-end'}} onPress={() => {var tuto = parseInt(this.state.tutorial); if(tuto>0){ this.setState({tutorial:(tuto-1).toString()})}} }>
                    <Text style={{fontFamily:'BebasNeueBold', fontSize:20}}>Atrás</Text>
                  </Button>
                  <Button disabled={this.state.tutorial >= '2'} style={{backgroundColor:this.state.tutorial < '2'?COLOR.verde:COLOR.gris,alignSelf:'flex-end'}} onPress={() => {var tuto = parseInt(this.state.tutorial); if(tuto<2){ this.setState({tutorial:(tuto+1).toString()})}} }>
                    <Text style={{fontFamily:'BebasNeueBold', fontSize:20}}>Siguiente</Text>
                  </Button>
                </View>
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
              {this.state.loading2 && <View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color='blue' /></View>}
            </Overlay>
        </Container>
      </Drawer>
    );
  }
}