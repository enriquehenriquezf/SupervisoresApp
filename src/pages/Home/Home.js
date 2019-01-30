import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Text, Icon, Button, Tabs, Tab, TabHeading, Drawer } from 'native-base';
import { View, AsyncStorage } from 'react-native';
import IconStyles from '../../styles/Icons';
import Activos from './Tabs/Activos';
import Completados from './Tabs/Completados';
import { COLOR } from '../../components/Colores';
import SideBar from '../SideBar';
import { api } from '../../services/api';
import { UserInfo } from '../../components/UserInfo';
import { toastr } from '../../components/Toast';

let user = [];
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      showToast: false,
      estado: true
    };
    let token = this.props.token;
    this._retrieveData();
    console.ignoredYellowBox = ['Require cycle:'];
  }

/**
   * Obtener Estado del supervisor
   */
  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('ESTADO');
      if (value !== null) {
        this.setState({estado : value});
      }
    } catch (error) {
      console.log(error);
    }
  }

  async componentWillMount() {
    this.getProfile();
  }  /**
   * Leer las actividades a realizar durante el día actual.
   */
  async getProfile()
  {
    let handler2 = false;
    let bodyInit = JSON.parse(token._bodyInit);
    const auth = bodyInit.token_type + " " + bodyInit.access_token;
    await fetch(api.ipProfileUser, {
      method: 'GET',
      headers: {
          'Authorization': auth,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept':'application/json'
      },
      body: ''
    }).then(function(response) {
      //console.log(response);
      newToken = JSON.parse(response._bodyInit);
      //console.log(newToken);
      if(response.ok === true && response.status === 200)
      {
        user = newToken;
      }
      else
      {
        console.log(response);
        if(response.status === 500){
          toastr.showToast('Error con el servidor','danger');
        }
        else if(response.status === 401){
          toastr.showToast('Su sesión expiró','danger');
          user = {};
          handler2 = true;
        }
        else{
          //toastr.showToast(newToken[actividades],'warning');
        }
      }
      //return response.json();
    }).catch(function(error){
      toastr.showToast('Su sesión expiró','danger');
      handler2 = true;
      console.log(error);
    });
    if(!handler2){
      this.setState({ loading: false });
    }
    else{this.props.handler2(-1,token,[]);}
  }

  render() {
    return (
      <Drawer
        ref={(ref) => { this.drawer = ref; }}
        content={<SideBar handler={this.props.handler} handler2={this.props.handler2} handler3={this.props.handler3} token={token} data={this.props.data} indexArray={this.props.indexArray} estado={this.state.estado} user={user}/>}
        onClose={() => this.drawer._root.close()} 
        initializeOpen={false}
        openDrawerOffset={0}
        panOpenMask={.5}
        styles={{ drawer: { shadowColor: "#000000",shadowOpacity: 0,shadowRadius: 0,elevation: 5,},mainOverlay:{opacity: 0,backgroundColor:'#00000000', elevation:8}}}>
        <Container>     
            <Header hasTabs style={{paddingTop: 50, paddingBottom:30, height:"10%", elevation:0, borderBottomRightRadius:100, backgroundColor:COLOR.azul}}>
              <Left>
                  <Button transparent onPress={() => this.drawer._root.open()}>
                    <Icon ios="ios-menu" android="md-menu" style={IconStyles.header}></Icon>
                  </Button>
              </Left>          
              <Body>
                {/*<Title>Actividades</Title>*/}
              </Body>
              {/*<Right>
                  <Button transparent onPress={() => this.props.handler2(3,token,[])}>
                      <Icon ios="ios-calendar" android="md-calendar" style={IconStyles.header}></Icon>
                  </Button>
                  <Button transparent onPress={() => this.props.handler2(-1,token,[])}>
                      <Icon ios="ios-log-out" android="md-log-out" style={IconStyles.header}></Icon>
                  </Button>
              </Right>*/}
            </Header>
          <UserInfo handler2={this.props.handler2} user={user} estado={this.state.estado}></UserInfo>
          <Tabs tabContainerStyle={{elevation:0}}>
            <Tab style={{backgroundColor: '#fff'}} heading={ <TabHeading style={{backgroundColor: '#fff'}}><View style={{backgroundColor:COLOR.azul, flex:.95, borderRadius: 10, justifyContent: 'center', alignItems: 'center'}}><Text style={{marginTop:10, marginBottom:10,fontFamily:'BebasNeueBold', fontWeight:'normal', fontSize:20}}>Activos</Text></View></TabHeading>}>
              <Activos handler2={this.props.handler2} token={token} data={this.props.data} estado={this.state.estado}/>
            </Tab>
            <Tab style={{backgroundColor: '#fff'}} heading={ <TabHeading style={{backgroundColor: '#fff'}}><View style={{backgroundColor:COLOR.azul, flex:.95, borderRadius: 10, justifyContent: 'center', alignItems: 'center'}}><Text style={{marginTop:10, marginBottom:10,fontFamily:'BebasNeueBold', fontWeight:'normal', fontSize:20}}>Completados</Text></View></TabHeading>}>
              <Completados handler2={this.props.handler2} token={token} data={this.props.data} estado={this.state.estado}/>
            </Tab>
          </Tabs>
        </Container>
      </Drawer>
    );
  }
}