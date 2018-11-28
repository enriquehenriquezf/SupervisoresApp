import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, List,ListItem,Text, Toast, Badge, Icon } from 'native-base';
import {View} from 'react-native';
import {ipHome} from '../services/api'

export const toastr = {
  /***
   * Mostrar Toast en la parte de abajo durante 3 segundos con un mensaje y tipo especifico
   * @param message: mensaje a mostrar en el Toast
   * @param tipo: tipo de Toast (success,warning,danger)
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
let sucursarActual = null;
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      showToast: false
    };
    let token = this.props.token;
    let newToken = null;
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

  async getPlanesDeTrabajo()
  {
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    //let ip = "http://192.168.1.136/supervisores_api/public/api/homeSupervisor";//"http://192.168.1.185/supervisores_api/public/api/homeSupervisor";
    await fetch(ipHome, {
      method: 'GET',
      headers: {
          'Authorization': auth,
          'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: ''
    }).then(function(response) {
      console.log(response);
      if(response.ok === true && response.status === 200)
      {
          newToken = JSON.parse(response._bodyInit);
          var actividades = "Actividades";
          console.log(Object.values(newToken[actividades]));
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
            if(i === 0){sucursarActual = element.nombre_sucursal; items.push({sucursal: element.nombre_sucursal, separador: true});}
            if(sucursarActual !== element.nombre_sucursal){items.push({sucursal: element.nombre_sucursal, separador: true}); sucursarActual = element.nombre_sucursal}
            i = i + 1;                                            
            items.push(item);
          });
          console.log(items)
      }
      else
      {
          toastr.showToast('No se encontraron planes de trabajo para hoy','warning');
      }
      //return response.json();
    });
    this.setState({ loading: false });
  }

  render() {
    if (this.state.loading) {
      return <Expo.AppLoading />;
    }
    return (
      <Container>
        <Header>
        <Left/>          
        <Body>
          <Title>Home</Title>
        </Body>
        <Right />
        </Header>
        <Content>
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
                item.estado === "activo" && <Icon active ios='ios-time' android='md-time' />
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