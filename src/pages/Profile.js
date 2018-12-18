import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, Text, Icon, Button, Spinner, H2, Item, Card, Input } from 'native-base';
import {Avatar} from 'react-native-elements';
import {toastr} from '../components/Toast';
import {View,Platform, BackHandler} from 'react-native';
//import styles from '../styles/Activity';
//import {api} from '../services/api'

let items = null;
export default class Activity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      showToast: false
    };
    let token = this.props.token;
    items = this.props.data;
    console.ignoredYellowBox = ['Require cycle:'];
  }

  async componentWillMount() {
    console.log(items);
    this.setState({ loading: false });
  }

  componentDidMount()
  {
    //console.log(items);
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
    navigator.geolocation.clearWatch(this.watchId);
    this.props.handler2(1,token,[]);
    return true;
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
          <Title>Perfil</Title>
        </Body>
        <Right/>
        </Header>
          <Content>
            <View style={{marginTop: 10, marginLeft:'auto', marginRight:'auto'}}>
                <Avatar size="xlarge"
                title={items.nombre.substring(0,1) + items.apellido.substring(0,1)}
                titleStyle={{color:'#039BE5'}}
                avatarStyle={{backgroundColor: '#FFF'}}
                containerStyle={{marginLeft:'auto', marginRight:'auto'}}
                source={{uri: "https://png.pngtree.com/svg/20160304/ajb_address_book_user_avatar_183015.png"}}
                onPress={() => console.log("Works!")}
                activeOpacity={0.5}
                />
                <H2 style={{margin: 5}}>{items.nombre} {items.apellido}</H2>
                <Item>
                    <Icon ios="ios-card" android="md-card" style={{color: '#039BE5'}}></Icon>
                    <Text style={{margin: 5}}>cedula: {items.cedula}</Text>
                </Item>
                <Item>
                    <Icon ios="ios-code" android="md-code" style={{color: '#039BE5'}}></Icon>
                    <Text style={{margin: 5}}>codigo: {items.codigo}</Text>
                </Item>
                <Item>
                    <Icon ios="ios-mail" android="md-mail" style={{color: '#039BE5'}}></Icon>
                    <Text style={{margin: 5}}>correo: {items.correo}</Text>
                </Item>
                <Item>
                    <Icon ios="ios-phone-portrait" android="md-phone-portrait" style={{color: '#039BE5'}}></Icon>
                    <Text style={{margin: 5}}>telefono: {items.telefono}</Text>
                </Item>
            </View>
          </Content>
      </Container>
    );
  }
}