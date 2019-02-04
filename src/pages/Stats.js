import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Content, Header, Left, Body, Right, Icon, Button, Spinner,Drawer, Card, Text } from 'native-base';
import IconStyles from '../styles/Icons';
import {toastr} from '../components/Toast';
import {api} from '../services/api'
import {View, BackHandler,Image, AsyncStorage} from 'react-native';
import SideBar from './SideBar';
import { COLOR } from '../components/Colores';

let items = null;
export default class Stats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      porcentajes:{},
      showToast: false
    };
    let token = this.props.token;
    items = this.props.data;
    this.closeDrawer = this.closeDrawer.bind(this);
    console.ignoredYellowBox = ['Require cycle:'];
  }

  async componentWillMount() {
    //console.log(items);
    this.getPorcentaje();
    this.state.porcentajes.hasOwnProperty('porcentaje_general') ?
        this.setState({ porcentajes:items, loading: false })
    :
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
   * Obtener cantidad de las actividades (activas, completas, noRealizadas)
   */
  async getPorcentaje(){
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
        //console.log(response);
        if(response.ok === true)
        {
          var porcentajes = JSON.parse(response._bodyInit);
          console.log(porcentajes)
          var general = (porcentajes.porcentaje_general.actividades_completas / porcentajes.porcentaje_general.todas_las_actividades) * 100;
          that._storeDataPorcentajes(Math.floor(general),porcentajes);
          that.setState({porcentajes:porcentajes});
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
   * Guardar datos de cantidad de actividades
   */
  _storeDataPorcentajes = async (general,porcentajes) => {
    try {
      await AsyncStorage.multiSet([['PORCENTAJE', ''+general],['PORCENTAJES', JSON.stringify(porcentajes)]]);
    } catch (error) {
      console.log(error);
    }
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
        content={<SideBar handler={this.props.handler} handler2={this.props.handler2}  layout={7} token={token} data={this.props.data} indexArray={this.props.indexArray} _retrieveData={this._retrieveData} closeDrawer={this.closeDrawer}/>}
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
          {
            this.state.porcentajes.hasOwnProperty('porcentaje_general') ?
            <Content>
                <Card key={1} style={{borderRadius:10,backgroundColor:COLOR.azul, borderColor:COLOR.azul, borderWidth:1, marginTop:25, marginLeft:20, marginRight:20}}>
                    <Text style={{color:'white', fontSize:24, fontFamily:'BebasNeueBold', textAlign:'center'}}>Porcentaje general</Text>
                    <Card key={Math.floor(Math.random() * 1000) + 1001} style={{borderColor: "rgba(255,255,255,0)", elevation:0, shadowOpacity:0,marginLeft:0,marginRight:0,marginBottom:0,borderLeftWidth:0,borderRightWidth:0,borderBottomWidth:0,borderRadius:0,borderBottomLeftRadius:10,borderBottomRightRadius:10}}>
                        <Text style={{color:COLOR.azul,fontFamily:'BebasKai', fontSize:18, paddingLeft:15}}> Activas: {this.state.porcentajes.porcentaje_general.actividades_activas}</Text>
                        <Text style={{color:COLOR.azul,fontFamily:'BebasKai', fontSize:18, paddingLeft:15}}> Completas: {this.state.porcentajes.porcentaje_general.actividades_completas}</Text>
                        <Text style={{color:COLOR.azul,fontFamily:'BebasKai', fontSize:18, paddingLeft:15}}> No Realizadas: {this.state.porcentajes.porcentaje_general.actividades_noRealizadas}</Text>
                        <Text style={{color:COLOR.azul,fontFamily:'BebasKai', fontSize:18, paddingLeft:15}}> Total: {this.state.porcentajes.porcentaje_general.todas_las_actividades}</Text>
                    </Card>
                </Card>
                <Card key={Math.floor(Math.random() * 100) + 101} style={{borderRadius:10,backgroundColor:COLOR.azul, borderColor:COLOR.azul, borderWidth:1, marginTop:25, marginLeft:20, marginRight:20}}>
                    <Text style={{color:'white', fontSize:24, fontFamily:'BebasNeueBold', textAlign:'center'}}>Porcentaje Sucursal</Text>
                    {
                        this.state.porcentajes.porcentaje_sucursal.map((data,index) => {
                            <Card key={Math.floor(Math.random() * 1000) + 1001} style={{borderColor: "rgba(255,255,255,0)", elevation:0, shadowOpacity:0,marginLeft:0,marginRight:0,marginBottom:0,borderLeftWidth:0,borderRightWidth:0,borderBottomWidth:0,borderRadius:0,borderBottomLeftRadius:10,borderBottomRightRadius:10}}>
                                <Text style={{color:COLOR.azul,fontFamily:'BebasKai', fontSize:18, paddingLeft:15}}> Activas: {data.actividades_activas}</Text>
                                <Text style={{color:COLOR.azul,fontFamily:'BebasKai', fontSize:18, paddingLeft:15}}> Completas: {data.actividades_completas}</Text>
                                <Text style={{color:COLOR.azul,fontFamily:'BebasKai', fontSize:18, paddingLeft:15}}> No Realizadas: {data.actividades_noRealizadas}</Text>
                                <Text style={{color:COLOR.azul,fontFamily:'BebasKai', fontSize:18, paddingLeft:15}}> Total: {data.todas_las_actividades}</Text>
                            </Card>
                        })//FIXME: error
                    }
                </Card>
            </Content>
            : 
                null
            }
        </Container>
      </Drawer>
    );
  }
}