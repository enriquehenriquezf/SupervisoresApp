import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, Text, Icon, Button, Spinner, H2, Item, Input } from 'native-base';
import styles from '../styles/Login';
import IconStyles from '../styles/Icons';
import {toastr} from '../components/Toast';
import {api} from '../services/api'
import {View, BackHandler} from 'react-native';

let items = null;
export default class ChangePass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      email : '',
      pass : '',
      verifyPass : '',
      code: '',
      showToast: false
    };
    let token = this.props.token;
    items = this.props.data;
    this.changePass = this.changePass.bind(this);
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
    if(items.FromLogin){
      this.props.handler2(0,null,[]);
    }
    else{
      this.props.handler2(5,token,items);
    }
    return true;
  }

  /**
   * Verificar codigo enviado al correo y que las contraseñas coincidan
   */
  changePass(handler)
  {
    if(this.state.pass === this.state.verifyPass){
      fetch(api.ipVerify, {
        method: 'POST',
        headers: {
            'Authorization': 'Access',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email: items.correo,password: this.state.pass, codigo: this.state.code})
      }).then(function(response) {
        console.log(response);
        if(response.ok === true)
        {
          toastr.showToast(JSON.parse(response._bodyInit),'success');
          if(items.FromLogin){
            handler(0,null,[]);
          }
          else{
            handler(5,token,items);
          }
        }
        else{toastr.showToast('Credenciales incorrectas','danger');}
        return response.json();
      }).catch(function(error){
        console.log(error);
      });
    }else{toastr.showToast('Contraseñas no coinciden','danger');}
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
        <Expo.LinearGradient colors={['#0277BD','#0277BD', '#FFF']} style={{ flex: 1}} start={[0.5,0.01]} end={[0.5,0.99]}>
        <Header style={{paddingTop: 20}}>
        <Left>
            <Button transparent style={IconStyles.back} onPress={() => this.handleBackPress()}>
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
            </View>
            <Item regular style={styles.form}>
              <Icon active ios='ios-person' android='md-person' style={styles.icon}/>
              <Input placeholder='Correo' placeholderTextColor='#f0f0f0' defaultValue={items.correo} onChangeText={(text) => this.setState({email: text})} keyboardType='email-address' autoCapitalize='none'  style={styles.input}/>
            </Item>
            <Item regular style={styles.form}>
              <Icon active ios='ios-code' android='md-code'  style={styles.icon}/>
              <Input placeholder='Codigo' placeholderTextColor='#f0f0f0' defaultValue={this.state.code} onChangeText={(text) => this.setState({code: text})} autoCapitalize='none'  style={styles.input}/>
            </Item>
            <Item regular style={styles.form}>
              <Icon active ios='ios-lock' android='md-lock'  style={styles.icon}/>
              <Input placeholder='Contraseña' placeholderTextColor='#f0f0f0' defaultValue={this.state.pass} secureTextEntry={true}  onChangeText={(text) => this.setState({pass: text})} autoCapitalize='none'  style={styles.input}/>
            </Item>
            <Item regular style={styles.form}>
              <Icon active ios='ios-lock' android='md-lock'  style={styles.icon}/>
              <Input placeholder='Confirmar Contraseña' placeholderTextColor='#f0f0f0' defaultValue={this.state.verifyPass} secureTextEntry={true}  onChangeText={(text) => this.setState({verifyPass: text})} autoCapitalize='none'  style={styles.input}/>
            </Item>
            <Item regular style={styles.boton}>
              <Body>
                <Button success regular block style={styles.boton2} onPress={() => this.changePass(this.props.handler2)}><Text style={styles.text}> Cambiar Contraseña </Text></Button>
              </Body>
            </Item>
          </Content>
          </Expo.LinearGradient>
      </Container>
    );
  }
}