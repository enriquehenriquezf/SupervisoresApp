import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, Text, Icon, Button, Spinner, H2, Item } from 'native-base';
import {Avatar} from 'react-native-elements';
import styles from '../styles/Profile';
import IconStyles from '../styles/Icons';
//import {toastr} from '../components/Toast';
import {api} from '../services/api'
import {View,Platform, BackHandler} from 'react-native';

let items = null;
export default class ChangePass extends Component {
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
    //console.log(items);
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
        <Expo.LinearGradient colors={['#0277BD','#FFF', '#FFF']} style={{ flex: 1}} start={[0.5,0.01]} end={[0.5,0.99]}>
        <Header style={{paddingTop: 20}}>
        <Left>
            <Button transparent onPress={() => this.props.handler2(1,token,[])}>
                <Icon ios="ios-arrow-back" android="md-arrow-back" style={IconStyles.header}></Icon>
            </Button>
        </Left>          
        <Body>
          <Title>Cambiar Contraseña</Title>
        </Body>
        <Right/>
        </Header>
          <Content>
            <View style={{marginTop: 10, marginLeft:'auto', marginRight:'auto'}}>
                <H2 style={{margin: 5, marginLeft:'auto', marginRight:'auto'}}>{items.nombre} {items.apellido}</H2>
                <Item style={{borderBottomColor: '#039BE5'}}>
                    <Icon ios="ios-card" android="md-card" style={{color: '#039BE5'}}></Icon>
                    <Text style={styles.text}>cedula: </Text>
                    <Text>{items.cedula}</Text>
                </Item>
                <Item style={{borderBottomColor: '#039BE5'}}>
                    <Icon ios="ios-code" android="md-code" style={{color: '#039BE5'}}></Icon>
                    <Text style={styles.text}>codigo: </Text>
                    <Text>{items.codigo}</Text>
                </Item>
                <Item style={{borderBottomColor: '#039BE5'}}>
                    <Icon ios="ios-mail" android="md-mail" style={{color: '#039BE5'}}></Icon>
                    <Text style={styles.text}>correo: </Text>
                    <Text>{items.correo}</Text>
                </Item>
                <Item style={{borderBottomColor: '#039BE5'}}>
                    <Icon ios="ios-phone-portrait" android="md-phone-portrait" style={{color: '#039BE5', marginLeft:5}}></Icon>
                    <Text style={styles.text}>  tels:     </Text>
                    <Text>{items.telefono}</Text>
                </Item>
                <Button info regular block style={styles.boton} ><Text> Cambiar Contraseña </Text></Button>
            </View>
          </Content>
          </Expo.LinearGradient>
      </Container>
    );
  }
}