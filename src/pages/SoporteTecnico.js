import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Content, Header, Left, Body, Right, Button, Spinner,Drawer, Text, Input,Textarea, Form } from 'native-base';
import IconStyles from '../styles/Icons';
import styles from '../styles/Reportes';
import {toastr} from '../components/Toast';
import {api} from '../services/api'
import {View, BackHandler,Image} from 'react-native';
import SideBar from './SideBar';
import { Imagen } from '../components/Imagenes';

let items = null;
export default class Stats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
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
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    var that = this;
    await fetch(api.ipPorcentajeActividades, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
        'Accept':'application/json'
      },
      body: ''
      }).then(function(response) {
        console.log(response);
        if(response.ok === true)
        {
          //var porcentajes = JSON.parse(response._bodyInit);
          //console.log(porcentajes)
          //that.setState({porcentaje: Math.floor(general),color:color, porcentajes:porcentajes});
          //console.log(Math.floor(general));
        }
        else
        {
          console.log(response);
          if(response.status === 500){
            toastr.showToast('Error con el servidor','danger');
          }
          else{
            //toastr.showToast('Credenciales incorrectas','danger');
          }
        }
        return response.json();
      }).catch(function(error){
        console.log(error);
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
          <Header hasTabs style={IconStyles.navbar}>
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
            <Content>
                <View style={{marginTop:50}}>
                    <Input style={[styles.asunto,{width:"85%", fontFamily:'BebasNeueBold', marginLeft:20}]} placeholder="Asunto" onChangeText={(text) => this.setState({asunto: text})}></Input>
                    <Form>
                        <Textarea bordered placeholder="Observaciones" style={[styles.observaciones,{height:200}]} onChangeText={(text) => this.setState({observacion: text})} />
                    </Form>
                    <Button disabled={this.state.disable} success regular block style={[styles.boton, styles.finalizar, {marginTop:20}]} onPress={() => {this.setState({disable:true}); this.CrearReporte()}}><Text> Enviar </Text></Button>
                </View>
            </Content>
        </Container>
      </Drawer>
    );
  }
}