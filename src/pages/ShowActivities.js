import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content,Text, Icon, Button, Spinner, Card } from 'native-base';
import {View, Platform, BackHandler} from 'react-native';
import {api} from '../services/api'

let dataArray = [];
let indexArray = 0;
let items = [];
export default class ShowActivities extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
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
   * Obtener actividades a realizar durante los proximos 7 días en dicha sucursal y organizarlas por planes de trabajo
   */
  async getPlanesDeTrabajo()
  {
    var nombreActual = null;
    var i = 0;
    var content = [];
    dataArray[indexArray].forEach(element => {
      //console.log(element);
      if(i === 0){
        nombreActual = element.title;
      }
      if(nombreActual === element.title){
        content.push(element.content);
      }
      else{
        items.push({title: nombreActual, content: content});
        content = [];
        content.push(element.content);
        nombreActual = element.title;
      }
      i++;
    });
    items.push({title: nombreActual, content: content});
    //console.log(items);
    this.setState({ loading: false });
  }

  render() { 
    /***
     * Mostrar layout luego de cargar los datos
     */
    if (this.state.loading) {
      return (<View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color='blue' /></View>);
    }
    /**
     * mostrar las fechas de una actividad dentro de un solo componente
     */
    const activities = items.map((data) => {
      return(
        <Card key={Math.floor(Math.random() * 1000) + 1} style={{borderRadius: 5, backgroundColor: "#039BE5"}}>
          <Text> {data.title}</Text>
          {
            data.content.map((data2) => {
              return(             
                <Card key={Math.floor(Math.random() * 1000) + 1001} style={{borderRadius: 5}}>
                  <Text> Fecha inicio: {data2.fecha_inicio}</Text>
                  <Text> Fecha fin: {data2.fecha_fin}</Text>
                </Card>
              )
            })
          }
        </Card>
      )
    })
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
          {activities}
        </Content>
      </Container>
    );
  }
}