import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, Text, Toast, Icon, Button, Spinner, Textarea, Form, ListItem, Radio } from 'native-base';
import {View,Platform, BackHandler} from 'react-native';
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

let items = null;
export default class Activity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      checked: 3 ,
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
   */
  SetChecked(i)
  {    
    this.setState({ checked: i });
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
                <ListItem button onPress={() => this.SetChecked(1)}>
                  <Left>
                    <Text>Tarde</Text>
                  </Left>
                  <Right>
                    {
                      this.state.checked === 1 ?                        
                        <Radio selected={true} onPress={() => this.SetChecked(1)}/>
                      :
                        <Radio selected={false} onPress={() => this.SetChecked(1)} />
                    }
                  </Right>
                </ListItem>
                <ListItem button onPress={() => this.SetChecked(2)}>
                  <Left>
                    <Text>Muy Tarde</Text>
                  </Left>
                  <Right>                    
                    {
                      this.state.checked === 2 ?                        
                        <Radio selected={true} onPress={() => this.SetChecked(2)}/>
                      :
                        <Radio selected={false} onPress={() => this.SetChecked(2)} />
                    }
                  </Right>
                </ListItem>
                <ListItem button onPress={() => this.SetChecked(3)}>
                  <Left>
                    <Text>Puntual</Text>
                  </Left>
                  <Right>                    
                    {
                      this.state.checked === 3 ?                        
                        <Radio selected={true} onPress={() => this.SetChecked(3)}/>
                      :
                        <Radio selected={false} onPress={() => this.SetChecked(3)} />
                    }
                  </Right>
                </ListItem>
              </View>
            :
              null
          }
          <Form>
            <Textarea rowSpan={3} bordered placeholder="Observaciones" defaultValue={items.observacion} />
          </Form>
          <Button success><Text> Finalizar </Text></Button>
        </Content>
      </Container>
    );
  }
}