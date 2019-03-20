import * as Expo from 'expo';
import React, { Component } from 'react';
import {toastr} from '../components/Toast';
import { Container, Body, Content, Spinner,Button,Text } from 'native-base';
import {View, Dimensions,AsyncStorage} from 'react-native';
import {Imagen} from '../components/Imagenes';
import Slideshow from 'react-native-image-slider-show';
import { COLOR } from '../components/Colores';

export default class Tutorial extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      tutorial:'0',
      isVisibleTutorial:false,
      tuto: [{url: Imagen.tuto1},{url: Imagen.tuto2},{url: Imagen.tuto3}],
    };
  }

  async componentWillMount() {
    this.setState({ loading: false });
  }

  /**
   * Guardar datos de usuario y contraseña en los datos globales de la aplicación
   */
  _storeData = async () => {
    try {
        await AsyncStorage.setItem('TUTORIAL',this.state.tutorial);
    } catch (error) {
    console.log(error);
    }
  }

  render() {
    /***
     * Mostrar layout luego de cargar los componentes
     */
    if (this.state.loading) {
      return (<View style={{marginTop: 'auto', marginBottom: 'auto'}}><Spinner color='blue' /></View>);
    }
    var height = Dimensions.get('window').height;
    return (
      <Container>
          <Content contentContainerStyle={{ justifyContent: 'center', flex: 1}}>
            <Slideshow 
                dataSource={this.state.tuto}
                height={height}
                arrowSize={0}
                indicatorSize={16}
                position={parseInt(this.state.tutorial)}
                onPositionChanged={position => this.setState({ tutorial: ''+position })}
                indicatorColor='#BDC3C9'
                indicatorSelectedColor='#97C023' />
            <View style={{position: 'absolute',bottom: 5,left: 0,right: 0,justifyContent: 'flex-end',alignItems: 'flex-end',flexDirection: 'row',backgroundColor: 'transparent'}}>
              {this.state.tutorial === '2' && 
              <Button disabled={this.state.tutorial !== '2'} style={{backgroundColor:this.state.tutorial === '2'?COLOR.verde:COLOR.gris,alignSelf:'center'}} onPress={() => {this._storeData(); (!this.props.data?toastr.showToast('Ha iniciado sesión!','success'):null); this.props.handler(1,this.props.token);} }>
                <Text style={{fontFamily:'BebasNeueBold', fontSize:20}}>Aceptar</Text>
              </Button>}
            </View>         
          </Content>
      </Container>
    );
  }
}