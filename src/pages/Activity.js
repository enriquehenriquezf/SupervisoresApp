import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, Text, Toast, Icon, Button, Spinner, Textarea, Form, ListItem, Radio } from 'native-base';
import {View,Platform, BackHandler} from 'react-native';
import {ipActivity} from '../services/api'

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

let items = null;
export default class Activity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      checked: 3 ,
      calificacion_pv: 'Puntual',
      observaciones: '',
      showToast: false
    };
    let token = this.props.token;
    items = this.props.data;
    console.ignoredYellowBox = ['Require cycle:'];
  }

  async componentWillMount() {
    this.setState({ loading: false });
  }

  componentDidMount()
  {
    /** Agregar el metodo handleBackPress al evento de presionar el boton "Back" de android */
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    /**
     * Seleccionar el radioButton que se obtuvo de la base de datos
     */
    if(items.calificacion_pv === 'Tarde')
    {
      this.SetChecked(1,'Tarde');
    }
    else if(items.calificacion_pv === 'Muy Tarde')
    {
      this.SetChecked(2,'Muy Tarde');
    }
    else if(items.calificacion_pv === 'Puntual')
    {
      this.SetChecked(3,'Puntual');
    }
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
   * seleccionar checkbox
   * @param {int} i indice del checkbox que se seleccionará
   * @param {String} calificacion_pv texto de calificacion del punto de venta
   */
  SetChecked(i,calificacion_pv)
  {    
    this.setState({ checked: i, calificacion_pv: calificacion_pv });
  }

  /**
   * Enviar datos de la actividad a la base de datos
   * @param {function} handler ir al layout de home luego de enviar los datos.
   */
  FinishActivity(handler)
  {
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    let id = '';
    if(items.id_apertura !== undefined){
      id = items.id_apertura;
    }
    fetch(ipActivity, {
      method: 'POST',
      headers: {
          'Authorization': auth,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        calificacion_pv: this.state.calificacion_pv, 
        nombre_tabla: items.nombre_tabla,
        id_plan_trabajo: items.id_plan_trabajo, 
        id_actividad: id,
        observaciones: this.state.observaciones
      })
    }).then(function(response) {
      console.log(response);
      newToken = JSON.parse(response._bodyInit);
      var message = "message";
      if(response.ok === true && response.status === 200)
      {
        toastr.showToast(newToken[message],'success');
        handler(1,token,[]);
      }
      else
      {
        toastr.showToast(newToken[message],'warning');
      }
    });
  }

  render() {
    /***
     * Mostrar layout luego de cargar los datos
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
          <Title>{items.sucursal}</Title>
        </Body>
        <Right />
        </Header>
        <Content>
          <Text>{items.name}</Text>
          {
            items.id_apertura !== undefined ?
              <View>
                <Text>Hora de apertura: </Text>              
                <ListItem button onPress={() => this.SetChecked(1,'Tarde')}>
                  <Left>
                    <Text>Tarde</Text>
                  </Left>
                  <Right>
                    {
                      this.state.checked === 1 ?                        
                        <Radio selected={true} onPress={() => this.SetChecked(1,'Tarde')}/>
                      :
                        <Radio selected={false} onPress={() => this.SetChecked(1,'Tarde')} />
                    }
                  </Right>
                </ListItem>
                <ListItem button onPress={() => this.SetChecked(2,'Muy Tarde')}>
                  <Left>
                    <Text>Muy Tarde</Text>
                  </Left>
                  <Right>                    
                    {
                      this.state.checked === 2 ?                        
                        <Radio selected={true} onPress={() => this.SetChecked(2,'Muy Tarde')}/>
                      :
                        <Radio selected={false} onPress={() => this.SetChecked(2,'Muy Tarde')} />
                    }
                  </Right>
                </ListItem>
                <ListItem button onPress={() => this.SetChecked(3,'Puntual')}>
                  <Left>
                    <Text>Puntual</Text>
                  </Left>
                  <Right>                    
                    {
                      this.state.checked === 3 ?                        
                        <Radio selected={true} onPress={() => this.SetChecked(3,'Puntual')}/>
                      :
                        <Radio selected={false} onPress={() => this.SetChecked(3,'Puntual')} />
                    }
                  </Right>
                </ListItem>
              </View>
            :
              null
          }
          <Form>
            <Textarea rowSpan={3} bordered placeholder="Observaciones" defaultValue={items.observaciones} onChangeText={(text) => this.setState({observaciones: text})} />
          </Form>
          {
            items.estado === 'Activo' ?
              <Button success onPress={() => this.FinishActivity(this.props.handler2)}><Text> Finalizar </Text></Button>
            :              
              <Button primary onPress={() => this.FinishActivity(this.props.handler2)}><Text> Modificar </Text></Button>
          }
        </Content>
      </Container>
    );
  }
}