import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Text, Icon, Button, Tabs, Tab, TabHeading } from 'native-base';
import { View } from 'react-native';
import IconStyles from '../../styles/Icons';
import Activos from './Tabs/Activos';
import Completados from './Tabs/Completados';
import { COLOR } from '../../components/Colores';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      showToast: false
    };
    let token = this.props.token;
    console.ignoredYellowBox = ['Require cycle:'];
  }

  render() {
    return (
      <Container>     
          <Header hasTabs style={{paddingTop: 40, elevation:0, borderBottomRightRadius:100, backgroundColor:COLOR.azul}}>
            <Left/>          
            <Body>
              {/*<Title>Actividades</Title>*/}
            </Body>
            <Right>
                <Button transparent onPress={() => this.props.handler2(3,token,[])}>
                    <Icon ios="ios-calendar" android="md-calendar" style={IconStyles.header}></Icon>
                </Button>
                <Button transparent onPress={() => this.props.handler2(-1,token,[])}>
                    <Icon ios="ios-log-out" android="md-log-out" style={IconStyles.header}></Icon>
                </Button>
            </Right>
          </Header>
          <Text>Aqui va el perfil</Text>
        <Tabs tabContainerStyle={{elevation:0}}>
          <Tab style={{backgroundColor: '#fff'}} heading={ <TabHeading style={{backgroundColor: '#fff'}}><View style={{backgroundColor:COLOR.azul, flex:.95, borderRadius: 10, justifyContent: 'center', alignItems: 'center'}}><Text style={{marginTop:10, marginBottom:10,fontFamily:'BebasNeueBold', fontWeight:'normal', fontSize:20}}>Activos</Text></View></TabHeading>}>
            <Activos handler2={this.props.handler2} token={token} data={this.props.data}/>
          </Tab>
          <Tab style={{backgroundColor: '#fff'}} heading={ <TabHeading style={{backgroundColor: '#fff'}}><View style={{backgroundColor:COLOR.azul, flex:.95, borderRadius: 10, justifyContent: 'center', alignItems: 'center'}}><Text style={{marginTop:10, marginBottom:10,fontFamily:'BebasNeueBold', fontWeight:'normal', fontSize:20}}>Completados</Text></View></TabHeading>}>
            <Completados handler2={this.props.handler2} token={token} data={this.props.data}/>
          </Tab>
        </Tabs>
      </Container>
    );
  }
}