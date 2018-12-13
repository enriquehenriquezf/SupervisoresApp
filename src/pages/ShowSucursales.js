import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, List,ListItem,Text, Toast, Badge, Icon, Button, Spinner, Card } from 'native-base';
import {View, Platform, BackHandler} from 'react-native';
import {ipShowActivities} from '../services/api'

export const toastr = {
  /***
   * Mostrar Toast en la parte de abajo durante 3 segundos con un mensaje y tipo especifico
   * @param {String} message mensaje a mostrar en el Toast
   * @param {String} tipo tipo de Toast (success,warning,danger)
   */
  showToast: (message,tipo) => {
    Toast.show({
      text: message,
      duration: 3000,
      buttonText: "Ok",
      type: tipo
    });
  },
};

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
    await fetch(ipShowActivities, {
      method: 'GET',
      headers: {
          'Authorization': auth,
          'Content-Type': 'application/x-www-form-urlencoded'
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
            var conte =  {title: item.name, content: "fecha inicio: " + item.fecha_inicio + "\n" + "fecha fin: " + item.fecha_fin };
            if(i === 0){sucursalActual = SUCURSAL; items.push({sucursal: SUCURSAL, separador: true, index: j}); j = j + 1;}
            if(sucursalActual === SUCURSAL){
              contenido.push(conte);
            }
            if(sucursalActual !== SUCURSAL){dataArray.push(contenido); contenido = [];   contenido.push(conte);   items.push({sucursal: SUCURSAL, separador: true, index: j}); sucursalActual = SUCURSAL; j = j + 1;}
            i = i + 1;                                            
            //items.push(item);
          });
          dataArray.push(contenido); contenido = [];
          console.log(dataArray);
          //console.log(items)
      }
      else
      {
        toastr.showToast('No se encontraron planes de trabajo esta semana','warning');
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
    else{this.props.handler2(0,null,[]);}
  }

  render() {
    /***
     * Mostrar layout luego de cargar las sucursales con planes de trabajo
     */
    if (this.state.loading) {
      return (<View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color='blue' /></View>);
    }
    return (
      <Container>
        <Header style={{paddingTop: 20}}>
        <Left>
            <Button transparent onPress={() => this.props.handler2(1,token,[])}>
                <Icon ios="ios-arrow-back" android="md-arrow-back" style={{fontSize: 20, color: Platform.OS === 'ios' ? 'black' : 'white'}}></Icon>
            </Button>
        </Left>          
        <Body>
          <Title>Actividades</Title>
        </Body>
        <Right>
            <Button transparent onPress={() => this.props.handler2(0,null,[])}>
                <Icon ios="ios-log-out" android="md-log-out" style={{fontSize: 20, color: Platform.OS === 'ios' ? 'black' : 'white'}}></Icon>
            </Button>
        </Right>
        </Header>
        <Content>
          <Card>
            <List dataArray={items}
              renderRow={(item) =>
              item.separador === true ?
                <ListItem button onPress={() => this.props.handler3(4,token,dataArray,item.index)}>
                  <Text>{item.sucursal}</Text>
                </ListItem>
              :
                <ListItem icon button>
                  <Left/>
                  <Body>
                    <Text>{item.name}</Text>
                  </Body>
                  <Right/>
                </ListItem>
              }>
            </List>
          </Card>
        </Content>
      </Container>
    );
  }
}