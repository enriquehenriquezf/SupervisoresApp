import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content,Text, Icon, Button, Spinner, Card, Drawer } from 'native-base';
import {View, BackHandler} from 'react-native';
import IconStyles from '../styles/Icons';
import SideBar from './SideBar';
import { COLOR } from '../components/Colores';

let dataArray = [];
//let indexArray = 0;
let items = [];
let SUCURSAL = 'Sucursal';
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
    //indexArray = this.props.indexArray;
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
    var j = 0;
    var content = [];
    //console.log(dataArray);
    dataArray.forEach(element => {
      //console.log(element);
      if(i === 0){
        nombreActual = element.title;
        SUCURSAL = element.sucursal;
      }
      if(nombreActual === element.title){
        content.push(element.content);
      }
      else{
        items.push({title: nombreActual, content: content, index: j});
        content = [];
        content.push(element.content);
        nombreActual = element.title;
        j++;
      }
      i++;
    });
    items.push({title: nombreActual, content: content, index: j});
    //console.log(items);
    this.setState({ loading: false });
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
    /**
     * mostrar las fechas de una actividad dentro de un solo componente
     */
    const activities = items.map((data,index) => {
      return(
        <Card key={index} style={{borderRadius:10,backgroundColor:COLOR.azul, borderColor:COLOR.azul, borderWidth:1, marginTop:25, marginLeft:20, marginRight:20}}>
          <Text style={{color:'white', fontSize:24, fontFamily:'BebasNeueBold', textAlign:'center'}}> {data.title}</Text>
          {
            data.content.map((data2,index2) => {
              return(
                index2 !== data.content.length-1?
                  <Card key={Math.floor(Math.random() * 1000) + 1001} style={{borderColor: "rgba(255,255,255,0)", elevation:0, shadowOpacity:0,marginLeft:0,marginRight:0,marginBottom:0,marginTop:0,borderLeftWidth:0,borderRightWidth:0,borderBottomWidth:0,borderRadius:0}}>
                    <Text style={{color:COLOR.azul,fontFamily:'BebasKai', fontSize:18, paddingLeft:15}}> Fecha inicio: {data2.fecha_inicio}</Text>
                    <Text style={{color:COLOR.azul,fontFamily:'BebasKai', fontSize:18, paddingLeft:15}}> Fecha fin: {data2.fecha_fin}</Text>
                  </Card>
                :
                  <Card key={Math.floor(Math.random() * 1000) + 1001} style={{borderColor: "rgba(255,255,255,0)", elevation:0, shadowOpacity:0,marginLeft:0,marginRight:0,marginBottom:0,borderLeftWidth:0,borderRightWidth:0,borderBottomWidth:0,borderRadius:0,borderBottomLeftRadius:10,borderBottomRightRadius:10}}>
                    <Text style={{color:COLOR.azul,fontFamily:'BebasKai', fontSize:18, paddingLeft:15}}> Fecha inicio: {data2.fecha_inicio}</Text>
                    <Text style={{color:COLOR.azul,fontFamily:'BebasKai', fontSize:18, paddingLeft:15}}> Fecha fin: {data2.fecha_fin}</Text>
                  </Card>
              )
            })
          }
        </Card>
      )
    })
    return (
      <Drawer
        ref={(ref) => { this.drawer = ref; }}
        content={<SideBar handler={this.props.handler} handler2={this.props.handler2}  layout={-1} token={token} data={this.props.data} indexArray={this.props.indexArray} _retrieveData={this._retrieveData} closeDrawer={this.closeDrawer}/>}
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
              {/* <Title>{SUCURSAL.substring(0,1) + SUCURSAL.substring(1,SUCURSAL.length).toLowerCase()}</Title> */}
            </Body>
            <Right>
            </Right>
          </Header>
          <Content>
            <Text style={{fontFamily:'BebasNeueBold',color: COLOR.azul,fontSize: 28, marginLeft:20, marginTop:10}}>{SUCURSAL}</Text>
            {activities}
          </Content>
        </Container>
      </Drawer>
    );
  }
}