import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, List,ListItem,Text, Toast, Badge, Icon, Button } from 'native-base';
import {View, Platform, BackHandler} from 'react-native';
import {ipShowActivities} from '../services/api'

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

  async getPlanesDeTrabajo()
  {
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
      console.log(response);
      if(response.ok === true && response.status === 200)
      {
          newToken = JSON.parse(response._bodyInit);
          var actividades = "Actividades";
          //console.log(Object.values(newToken[actividades]));
          var i = 0;
          Object.values(newToken[actividades]).forEach(element => {
            //console.log(JSON.stringify(element));
            console.log(Object.values(element));
            var valores = Object.values(element)[0];
            var SUCURSAL = Object.keys(element)[0];
            var item = {
              name: valores.nombre_actividad,
              sucursal: SUCURSAL,
              fecha_inicio: valores.fecha_inicio,
              fecha_fin: valores.fecha_fin,
              id_plan_trabajo: valores.id_plan_trabajo,
              separador: false
            };
            if(i === 0){sucursalActual = SUCURSAL; items.push({sucursal: SUCURSAL, separador: true});}
            if(sucursalActual !== SUCURSAL){items.push({sucursal: SUCURSAL, separador: true}); sucursalActual = SUCURSAL}
            i = i + 1;                                            
            items.push(item);
          });
          console.log(items)
      }
      else
      {
          toastr.showToast('No se encontraron planes de trabajo esta semana','warning');
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
        <List dataArray={items}
        renderRow={(item) =>
          item.separador === true ?
            <ListItem itemDivider>
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
        </Content>
      </Container>
    );
  }
}