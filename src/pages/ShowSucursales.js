/**
 * @author Enrique Henriquez Figueroa
 * @copyright Binar10
 */
import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, List,ListItem,Text, Icon, Button, Spinner, Card, Drawer } from 'native-base';
import {toastr} from '../components/Toast';
import {View, BackHandler, Image} from 'react-native';
import IconStyles from '../styles/Icons';
import {api} from '../services/api';
import SideBar from './SideBar';
import { COLOR } from '../components/Colores';
import { Imagen } from '../components/Imagenes';

let items = [];
let sucursalActual = null;
let dataArray = [];
let contenido = [];
export default class ShowSucursales extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      showToast: false
    };
    let token = this.props.token;
    let newToken = null;
    items = [];
    dataArray = [];
    contenido = [];
    this.closeDrawer = this.closeDrawer.bind(this);
    console.ignoredYellowBox = ['Require cycle:'];
  }

  async componentWillMount() {
    this.getPlanesDeTrabajo();
  }
  
  componentDidMount()
  {
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
   * Obtener actividades a realizar durante los proximos 7 días
   */
  async getPlanesDeTrabajo()
  {
    let handler2 = false;
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    await fetch(api.ipShowActivities, {
      method: 'GET',
      headers: {
          'Authorization': auth,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept':'application/json'
      },
      body: ''
    }).then(function(response) {
      //console.log(response);
      if(response.ok === true && response.status === 200)
      {
        newToken = JSON.parse(response._bodyInit);
        var actividades = "Actividades";
        //console.log(Object.values(newToken[actividades]));
        var i = 0;
        var j = 0;
        var SUCURSAL = null;
        Object.values(newToken[actividades]).forEach(element => {
          //console.log(Object.values(element));
          var valores = Object.values(element)[0];
          SUCURSAL = Object.keys(element)[0];
          var options = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'America/New_York' };
          var fi = new Date(Date.parse(valores.fecha_inicio.split(' ')[0]));
          fi.setDate(fi.getDate()+1);
          var ff = new Date(Date.parse(valores.fecha_fin.split(' ')[0]));
          ff.setDate(ff.getDate()+1);         
          var item = {
            name: valores.nombre_actividad,
            sucursal: SUCURSAL,
            fecha_inicio: fi.toLocaleDateString('es-ES', options),
            fecha_fin: ff.toLocaleDateString('es-ES', options),
            id_plan_trabajo: valores.id_plan_trabajo,
            separador: false
          };
          //console.log(JSON.stringify(item));
          var conte =  {title: item.name, content: {fecha_inicio: item.fecha_inicio , fecha_fin: item.fecha_fin}, sucursal: SUCURSAL };
          if(i === 0){sucursalActual = SUCURSAL; items.push({sucursal: SUCURSAL, separador: true, index: j}); j = j + 1;}
          if(sucursalActual === SUCURSAL){
            contenido.push(conte);
          }
          if(sucursalActual !== SUCURSAL){dataArray.push(contenido); contenido = [];   contenido.push(conte);   items.push({sucursal: SUCURSAL, separador: true, index: j}); sucursalActual = SUCURSAL; j = j + 1;}
          i = i + 1;
          //items.push(item);
        });
        dataArray.push(contenido); contenido = [];
        //console.log(dataArray);
        //console.log(items)
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
          toastr.showToast('No se encontraron planes de trabajo esta semana','warning');
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
   * cerrar SideBar
   */
  closeDrawer(){
    this.drawer._root.close();
  }

  render() {
    /***
     * Mostrar layout luego de cargar las sucursales con planes de trabajo
     */
    if (this.state.loading) {
      return (<View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color={COLOR.azul} /></View>);
    }
    return (
      <Drawer
        ref={(ref) => { this.drawer = ref; }}
        content={<SideBar handler={this.props.handler} handler2={this.props.handler2} rol={1} layout={3} token={token} data={this.props.data} indexArray={this.props.indexArray} _retrieveData={this._retrieveData} closeDrawer={this.closeDrawer}/>}
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
            <Header hasTabs style={IconStyles.navbar}>
              <Left>
                <Button transparent onPress={() => this.drawer._root.open()}>
                  {/* <Icon ios="ios-menu" android="md-menu" style={IconStyles.menu}></Icon> */}
                  <Image style={IconStyles.menu2} source={Imagen.home}></Image>
                </Button>
              </Left>           
              <Body>
                {/* <Title>Actividades</Title> */}
              </Body>
              <Right>
              </Right>
            </Header>
          </Expo.LinearGradient>
          <Content>
            {
              dataArray.length > 0 ?
                  <List dataArray={items}
                    style={{marginTop:30, marginLeft:20, marginRight:20}}
                    renderRow={(item) =>
                      <Card style={{borderRadius:10, backgroundColor:COLOR.azul, borderColor:COLOR.azul, borderWidth:2}}>
                        <ListItem button onPress={() => this.props.handler2(4,token,dataArray[item.index])} style={{borderBottomColor:'rgba(255,255,255,0)'}}>
                          <Text style={{fontFamily:'BebasNeueBold', color:'white', fontSize:28}}>{item.sucursal}</Text>
                        </ListItem>
                      </Card>
                    }>
                  </List>
              :
                null
            }
          </Content>
        </Container>
      </Drawer>
    );
  }
}