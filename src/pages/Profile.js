/**
 * @author Enrique Henriquez Figueroa
 * @copyright Binar10
 */
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
import { logError } from '../components/logError';

let items = null;
export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      loading2:false,
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
          const auth = bodyInit.token_type + " " + bodyInit.access_token;
          var newToken = JSON.parse(response._bodyInit);
          var header = JSON.stringify({ok:response.ok, status:response.status, statusText:response.statusText, type:response.type, url:response.url});
          var body = JSON.stringify({message:newToken.message,exception:newToken.exception,file:newToken.file,line:newToken.line});
          logError.sendError(header,body,auth);
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
                <Image style={IconStyles.menu2} source={Imagen.home}></Image>
              </Button>
            </Left>       
            <Body>
              {/*<Title>Perfil</Title>*/}
            </Body>
            <Right>
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
                  <Button info regular block style={[styles.boton,{backgroundColor:COLOR.amarillo}]} onPress={() => this.props.handler2(10,this.props.token,true)}><Text style={styles.textoBoton}> Ver Tutorial </Text></Button>
              </View>
            </Content>
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