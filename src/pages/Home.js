import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, List,ListItem,Text, Toast, Badge, Icon, Button, Thumbnail } from 'native-base';
import {View, Platform} from 'react-native';
import {ipHome} from '../services/api'

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
let user = [];
let sucursalActual = null;
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      showToast: false
    };
    let token = this.props.token;
    let newToken = null;
    items = [];
    console.ignoredYellowBox = ['Require cycle:'];
  }

  async componentWillMount() {
    /***
     * Cargar tipos de fuentes antes de mostrar el layout.
     */
    await Expo.Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
    });
    this.getPlanesDeTrabajo();
  }
  /**
   * Leer las actividades a realizar durante el día actual.
   */
  async getPlanesDeTrabajo()
  {
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    await fetch(ipHome, {
      method: 'GET',
      headers: {
          'Authorization': auth,
          'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: ''
    }).then(function(response) {
      //console.log(response);
      newToken = JSON.parse(response._bodyInit);
      var actividades = "Actividades";
      var datos_usuario = "datos_usuario";
      //console.log(newToken[datos_usuario]);
      user = newToken[datos_usuario];
      if(response.ok === true && response.status === 200)
      {
          //console.log(Object.values(newToken[actividades]));
          let keys = Object.keys(newToken[actividades]);
          var i = 0;
          Object.values(newToken[actividades]).forEach(element => {
            //console.log(JSON.stringify(element.nombre_tabla));
            var item = {
              name: keys[i],
              sucursal: element.nombre_sucursal,
              prioridad: element.id_prioridad,
              estado: element.estado,
              id_plan_trabajo: element.id_plan_trabajo,
              calificacion_pv: element.calificacion_pv,
              observacion: element.observacion,
              id_kardex: element.id_kardex,
              id_apertura: element.id_apertura,
              id_formula: element.id_formula,
              id_condiciones: element.id_condiciones,
              separador: false
            };
            if(i === 0){sucursalActual = element.nombre_sucursal; items.push({sucursal: element.nombre_sucursal, separador: true});}
            if(sucursalActual !== element.nombre_sucursal){items.push({sucursal: element.nombre_sucursal, separador: true}); sucursalActual = element.nombre_sucursal}
            i = i + 1;                                            
            items.push(item);
          });
          console.log(items)
      }
      else
      {
          toastr.showToast(newToken[actividades],'warning');//No se encontraron planes de trabajo para hoy
      }
      //return response.json();
    });
    this.setState({ loading: false });
  }

  render() {
    /***
     * Mostrar layout luego de cargar tipos de fuente
     */
    if (this.state.loading) {
      return <Expo.AppLoading />;
    }
    return (
      <Container>
        <Header style={{paddingTop: 20}}>
        <Left/>          
        <Body>
          <Title>Home</Title>
        </Body>
        <Right>
            <Button transparent onPress={() => this.props.handler2(3,token,[])}>
                <Icon ios="ios-calendar" android="md-calendar" style={{fontSize: 20, color: Platform.OS === 'ios' ? 'black' : 'white'}}></Icon>
            </Button>
            <Button transparent onPress={() => this.props.handler2(0,null,[])}>
                <Icon ios="ios-log-out" android="md-log-out" style={{fontSize: 20, color: Platform.OS === 'ios' ? 'black' : 'white'}}></Icon>
            </Button>
        </Right>
        </Header>
        <Content>
          <List>
            <ListItem avatar style={{marginBottom: 5}}>
              <Left>
                <Thumbnail source={{ uri: 'https://banner2.kisspng.com/20180410/bbw/kisspng-avatar-user-medicine-surgery-patient-avatar-5acc9f7a7cb983.0104600115233596105109.jpg' }} />
              </Left>
              <Body>
                <Text>{user.nombre} {user.apellido}</Text>
                <Text note>{user.cedula}</Text>
              </Body>
              <Right>
                <Text note>{user.codigo}</Text>
              </Right>
            </ListItem>
          </List>
          <List dataArray={items}
          renderRow={(item) =>
            item.separador === true ?
              <ListItem itemDivider>
                <Text>{item.sucursal}</Text>
              </ListItem>
            :
              <ListItem icon button onPress={() => this.props.handler2(2,token,item)}>
                <Left>
                {
                  (item.estado === "activo" || item.estado === "Activo") && <Icon active ios='ios-time' android='md-time' />
                }
                {
                  item.estado === "terminado" && <Icon active ios='ios-checkmark' android='md-checkmark' />
                }
                {
                  item.estado === "completo" && <Icon active ios='ios-checkmark' android='md-checkmark' />
                }
                </Left>
                <Body>
                  <Text>{item.name}</Text>
                </Body>
                <Right>
                  {
                    item.prioridad === 5 && <Badge><Text>urgente</Text></Badge>
                  }
                  {                  
                    item.prioridad === 2 && <Badge warning><Text>media</Text></Badge>
                  }
                  {                  
                    item.prioridad === 1 && <Badge info><Text>normal</Text></Badge>
                  }
                </Right>
              </ListItem>
            }>
          </List>
        </Content>
      </Container>
    );
  }
}