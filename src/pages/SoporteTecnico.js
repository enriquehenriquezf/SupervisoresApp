/**
 * @author Enrique Henriquez Figueroa
 * @copyright Binar10
 */
import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Content, Header, Left, Body, Right, Button, Spinner,Drawer, Text, Input,Textarea, Form } from 'native-base';
import IconStyles from '../styles/Icons';
import styles from '../styles/Reportes';
import {toastr} from '../components/Toast';
import {api} from '../services/api'
import {View, BackHandler,Image,KeyboardAvoidingView,WebView} from 'react-native';
import SideBar from './SideBar';
import { Imagen } from '../components/Imagenes';
import Overlay from 'react-native-modal-overlay';
import { logError } from '../components/logError';
import { COLOR } from '../components/Colores';

let items = null;
export default class Stats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      loading2:false,
      loadingTawk:false,
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
        if(error.toString().includes('Network request failed')){toastr.showToast('Verifique su conexión a internet ó Contactese con el administrador','warning');}
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
      return (<View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color={COLOR.azul} /></View>);
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
          <Expo.LinearGradient
            colors={['#FD0047', '#FDBB01']}
            start={[0,.5]}
            end={[1,.5]}
            style={IconStyles.gradient}>
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
          </Expo.LinearGradient>
          <KeyboardAvoidingView behavior="padding" enabled style={{flex: 1}}>
            <Content contentContainerStyle={{ justifyContent: 'center', flex: 1 }}>
                <WebView
                  style={{width:"100%"}}
                  source={{uri: 'https://tawk.to/chat/5d1e14a87a48df6da242fa24/default' }}
                  startInLoadingState={true}
                  renderLoading={() => {return(<View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color='#FD3533' /></View>);}}
                  onLoadEnd={(load) => {/*console.log(load);*/}}
                  onError={(error) => {console.log('error: ');console.log(error)}}
                />

                {/* <View style={{marginTop:40}}>
                  <Text style={{fontFamily:'BebasNeueBold', paddingHorizontal:20,marginBottom:20,textAlign:'justify',color:COLOR.azul}}>Envíanos un mensaje con respecto a algún error evidenciado en la aplicación.</Text>
                  <Input style={[styles.asunto,{width:"85%", fontFamily:'BebasNeueBold', marginLeft:20}]} placeholder="Asunto" onChangeText={(text) => this.setState({asunto: text})}></Input>
                  <Form>
                      <Textarea bordered placeholder="Mensaje" style={[styles.observaciones,{height:200,fontSize:20,textAlign:'auto', textAlignVertical:'top', paddingTop:5}]} onChangeText={(text) => this.setState({mensaje: text})} />
                  </Form>
                  <Button disabled={this.state.disable} success regular block style={[styles.boton, styles.finalizar, {marginTop:20}]} onPress={() => {this.setState({disable:true}); this.EnviarBug()}}><Text> Enviar </Text></Button>
                </View> */}
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
            {this.state.loading2 && <View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color={COLOR.azul} /></View>}
          </Overlay>
        </Container>
      </Drawer>
    );
  }
}