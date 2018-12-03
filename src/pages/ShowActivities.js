import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content,Text, Toast, Icon, Button, Accordion, Spinner } from 'native-base';
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

let dataArray = [];
let indexArray = 0;
export default class ShowActivities extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      showToast: false
    };
    let token = this.props.token;
    let newToken = null;
    items = [];
    dataArray = this.props.data;
    indexArray = this.props.indexArray;
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
    this.props.handler2(3,token,[]);
    return true;
  }
  /**
   * Obtener actividades a realizar durante los proximos 7 días
   */
  async getPlanesDeTrabajo()
  {
    this.setState({ loading: false });
  }


  _renderHeader(title, expanded) {
    return (
      <View
        style={{ flexDirection: "row", padding: 10, justifyContent: "space-between", alignItems: "center", backgroundColor: "#A9DAD6" }}
      >
        <Text style={{ fontWeight: "600" }}>
          {" "}{title}
        </Text>
        {expanded ?
            <Icon style={{ fontSize: 18 }} name="remove-circle" />
          :  
            <Icon style={{ fontSize: 18 }} name="add-circle" />
        }
      </View>
    );
  }
  _renderContent(content) {
    return (
      <Text
        style={{ backgroundColor: "#e3f1f1", padding: 10, fontStyle: "italic" }}
      >
        {content}
      </Text>
    );
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
            <Button transparent onPress={() => this.props.handler2(3,token,[])}>
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
          <Accordion
            dataArray={dataArray[indexArray]}
          />
        </Content>
      </Container>
    );
  }
}