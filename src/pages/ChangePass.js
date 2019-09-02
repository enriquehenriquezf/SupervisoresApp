/**
 * @author Enrique Henriquez Figueroa
 * @copyright Binar10
 */
import * as Expo from 'expo';
import React, { Component } from 'react';
import { Container, Header, Left, Body, Right, Title, Content, Text, Icon, Button, Spinner, H2, Item, Input,Drawer, Thumbnail } from 'native-base';
import styles from '../styles/Profile';
import IconStyles from '../styles/Icons';
import {toastr} from '../components/Toast';
import {api} from '../services/api'
import {View, BackHandler,Image, KeyboardAvoidingView} from 'react-native';
import { Imagen } from '../components/Imagenes';
import { COLOR } from '../components/Colores';
import SideBar from './SideBar';

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
    this.closeDrawer = this.closeDrawer.bind(this);
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
            'Content-Type': 'application/json',
            'Accept':'application/json'
        },
        body: JSON.stringify({email: items.correo,password: this.state.pass, codigo: this.state.code})
      }).then(function(response) {
        //console.log(response);
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
        else
        {
          console.log(response);
          if(response.status === 500){
            toastr.showToast('Error con el servidor','danger');
          }
          else if(response.status === 400){
            toastr.showToast(JSON.parse(response._bodyInit),'warning');
          }
          else{
            toastr.showToast('Credenciales incorrectas','danger');
          }
        }
        return response.json();
      }).catch(function(error){
        console.log(error);
      });
    }else{toastr.showToast('Contraseñas no coinciden','warning');}
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
      return (<View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color={COLOR.azul} /></View>);
    }
    return (
      <Drawer
        ref={(ref) => { this.drawer = ref; }}
        content={<SideBar handler={this.props.handler} handler2={this.props.handler2} rol={1} layout={-1} data={this.props.data} indexArray={this.props.indexArray} _retrieveData={this._retrieveData} closeDrawer={this.closeDrawer}/>}
        onClose={() => this.drawer._root.close()} 
        initializeOpen={false}
        openDrawerOffset={0}
        panOpenMask={.05}
        panCloseMask={.02}
        styles={{ drawer: { shadowColor: "#000000",shadowOpacity: 0,shadowRadius: 0,elevation: 5,},mainOverlay:{opacity: 0,backgroundColor:'#00000000', elevation:8}}}
        >
        <Container>
          <Expo.LinearGradient
            colors={['#FF3153', '#FF7B3D']}
            start={[0,.5]}
            end={[1,.5]}
            style={IconStyles.gradient}>
            <Header hasTabs style={IconStyles.navbar}>
              <Left>
                <Button transparent onPress={() => items.FromLogin ? null : this.drawer._root.open()}>
                  <Icon ios="ios-menu" android="md-menu" style={IconStyles.menu}></Icon>
                </Button>
              </Left>       
              <Body>
                {/*<Title>Cambiar Contraseña</Title>*/}
              </Body>
              <Right>
              </Right>
            </Header>
          </Expo.LinearGradient>
          <KeyboardAvoidingView behavior="padding" enabled style={{flex: 1}}>
            <Content>
              <View style={{marginTop: 10, marginLeft:'auto', marginRight:'auto'}}>
                  {/* <Thumbnail square large source={Imagen.profileBorder} style={{width:160, height:160}}/> */}
                  {!items.FromLogin && 
                    <Thumbnail large
                    source={{uri: items.foto}}
                    style={styles.foto}
                    />
                  }
                  {!items.FromLogin &&
                    <H2 style={styles.textH2}>{items.nombre} {items.apellido}</H2>
                  }
                  <Item style={styles.item}>
                      <Image source={Imagen.mail} style={styles.icono}></Image>
                      <Input placeholder='Correo' placeholderTextColor={COLOR.gris} defaultValue={items.correo} onChangeText={(text) => this.setState({email: text})} keyboardType='email-address' autoCapitalize='none'  style={styles.input}/>
                  </Item>
                  <Item style={styles.item}>
                      <Image source={Imagen.code} style={styles.icono}></Image>
                      <Input placeholder='Codigo' placeholderTextColor={COLOR.gris} defaultValue={this.state.code} onChangeText={(text) => this.setState({code: text})} autoCapitalize='none' keyboardType='number-pad'  style={styles.input}/>
                  </Item>
                  <Item style={styles.item}>
                      <Image source={Imagen.pass} style={styles.icono}></Image>
                      <Input placeholder='Contraseña' placeholderTextColor={COLOR.gris} defaultValue={this.state.pass} secureTextEntry={true}  onChangeText={(text) => this.setState({pass: text})} autoCapitalize='none'  style={styles.input}/>
                  </Item>
                  <Item style={styles.item}>
                      <Image source={Imagen.pass} style={styles.icono}></Image>
                      <Input placeholder='Confirmar Contraseña' placeholderTextColor={COLOR.gris} defaultValue={this.state.verifyPass} secureTextEntry={true}  onChangeText={(text) => this.setState({verifyPass: text})} autoCapitalize='none'  style={styles.input}/>
                  </Item>
                  <Button info regular block style={styles.boton2} onPress={() => this.changePass(this.props.handler2)}><Text style={styles.textoBoton}> Cambiar Contraseña </Text></Button>
              </View>
            </Content>
          </KeyboardAvoidingView>
        </Container>
      </Drawer>
    );
  }
}