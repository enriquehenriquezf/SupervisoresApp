import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Content, Header, Left, Body, Right, Button, Spinner,Drawer, Text, Input,Textarea, Form } from 'native-base';
import IconStyles from '../styles/Icons';
import styles from '../styles/Reportes';
import {toastr} from '../components/Toast';
import {api} from '../services/api'
import {View, BackHandler,Image,KeyboardAvoidingView} from 'react-native';
import SideBar from './SideBar';
import { Imagen } from '../components/Imagenes';
import Overlay from 'react-native-modal-overlay';
import { logError } from '../components/logError';

let items = null;
export default class Stats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      loading2:false,
      asunto:'',
      mensaje:'',
      showToast: false
    };
    let token = this.props.token;
    items = this.props.data;
    this.closeDrawer = this.closeDrawer.bind(this);
    console.ignoredYellowBox = ['Require cycle:'];
  }

  async componentWillMount() {
    //console.log(items);
    this.setState({ loading: false })
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
   * Enviar mensaje de algun error encontrado en la app
   */
  async EnviarBug(){
    this.setState({loading2:true});
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    var that = this;
    await fetch(api.ipSoporteTecnico, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
        'Accept':'application/json'
      },
      body: JSON.stringify({
          asunto: this.state.asunto,
          mensaje: this.state.mensaje
        })
      }).then(function(response) {
        console.log(response);
        if(response.ok === true)
        {
          var resp = JSON.parse(response._bodyInit);
          //console.log(resp)
          that.setState({loading2:false,disable:false});
          toastr.showToast(JSON.parse(response._bodyInit),'success');
        }
        else
        {
          console.log(response);
          var newToken = JSON.parse(response._bodyInit);
          var header = JSON.stringify({ok:response.ok, status:response.status, statusText:response.statusText, type:response.type, url:response.url});
          var body = JSON.stringify({message:newToken.message,exception:newToken.exception,file:newToken.file,line:newToken.line});
          logError.sendError(header,body,auth);
          that.setState({loading2:false,disable:false});
          if(response.status === 500){
            toastr.showToast('Error con el servidor','danger');
          }
          else{
            toastr.showToast(JSON.parse(response._bodyInit),'warning');
          }
        }
        return response.json();
      }).catch(function(error){
        console.log(error);
        that.setState({loading2:false,disable:false});
        toastr.showToast('Verifique su conexión a internet','warning');
        if(error.toString().includes('Network request failed')){toastr.showToast('Contactese con el administrador','warning');}
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
        content={<SideBar handler={this.props.handler} handler2={this.props.handler2} rol={1} layout={9} token={token} data={this.props.data} indexArray={this.props.indexArray} _retrieveData={this._retrieveData} closeDrawer={this.closeDrawer}/>}
        onClose={() => this.drawer._root.close()} 
        initializeOpen={false}
        openDrawerOffset={0}
        panOpenMask={.05}
        panCloseMask={.02}
        styles={{ drawer: { shadowColor: "#000000",shadowOpacity: 0,shadowRadius: 0,elevation: 5,},mainOverlay:{opacity: 0,backgroundColor:'#00000000', elevation:8}}}
        >
        <Container>
          <Header style={IconStyles.navbar}>
            <Left>
              <Button transparent onPress={() => this.drawer._root.open()}>
                {/* <Icon ios="ios-menu" android="md-menu" style={IconStyles.menu}></Icon> */}
                <Image style={IconStyles.menu2} source={Imagen.home}></Image>
              </Button>
            </Left>       
            <Body>
            </Body>
            <Right>
            </Right>
          </Header>
          <KeyboardAvoidingView behavior="padding" enabled style={{flex: .9}}>
            <Content contentContainerStyle={{ justifyContent: 'center', flex: 1 }}>
                <View style={{marginTop:60}}>
                    <Input style={[styles.asunto,{width:"85%", fontFamily:'BebasNeueBold', marginLeft:20}]} placeholder="Asunto" onChangeText={(text) => this.setState({asunto: text})}></Input>
                    <Form>
                        <Textarea bordered placeholder="Mensaje" style={[styles.observaciones,{height:200}]} onChangeText={(text) => this.setState({mensaje: text})} />
                    </Form>
                    <Button disabled={this.state.disable} success regular block style={[styles.boton, styles.finalizar, {marginTop:20}]} onPress={() => {this.setState({disable:true}); this.EnviarBug()}}><Text> Enviar </Text></Button>
                </View>
            </Content>
          </KeyboardAvoidingView>
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