import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, Text, Icon, Button, Spinner, H2, Item } from 'native-base';
import {Avatar} from 'react-native-elements';
import styles from '../styles/Profile';
//import {toastr} from '../components/Toast';
//import {api} from '../services/api'
import {View,Platform, BackHandler} from 'react-native';

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
    //this._OnLogout = this._OnLogout.bind(this);
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
        <Expo.LinearGradient colors={['#0277BD','#FFF', '#FFF']} style={{ flex: 1}} start={[0.5,0.01]} end={[0.5,0.99]}>
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
                <Avatar size="xlarge" rounded
                title={items.nombre.substring(0,1) + items.apellido.substring(0,1)}
                titleStyle={{color:'#039BE5',backgroundColor: 'rgba(255,255,255,0)'}}
                avatarStyle={{backgroundColor: 'rgba(255,255,255,0)'}}
                containerStyle={{marginLeft:'auto', marginRight:'auto', borderWidth:4, borderColor:'#FFF'}}
                source={{uri: "https://assets4.domestika.org/project-items/001/228/844/sesion-estudio-barcelona-10-big.jpg?1425034585"}}// https://png.pngtree.com/svg/20160304/ajb_address_book_user_avatar_183015.png
                onPress={() => console.log("Works!")}
                activeOpacity={0.5}
                />
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
                <Button info regular block style={styles.boton}><Text> Cambiar Contraseña </Text></Button>
                <Button danger regular block style={styles.boton} onPress={() => this.props.handler2(-1,token,[])}><Text> Cerrar Sesión </Text></Button>
            </View>
          </Content>
          </Expo.LinearGradient>
      </Container>
    );
  }
}