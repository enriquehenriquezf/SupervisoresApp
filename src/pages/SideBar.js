import React from "react";
import { Image, View, TouchableOpacity, Dimensions, AsyncStorage } from "react-native";
import { Text, Container, Content, Icon} from "native-base";
import styles from '../styles/SideBar';
import { Imagen } from "../components/Imagenes";

export default class SideBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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
          var state;
          if(value === 'true'){state=true}else{state=false}
        this.setState({estado : state});
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Guardar estado del supervisor (Activo/Inactivo)
   */
  _storeData = async (estado2) => {
    try {
      var state = '';
      var time =  new Date().getTime().toString();
      if(estado2){
        state = 'true';
        await AsyncStorage.multiSet([['ESTADO', state],['TIME_INACTIVO',time]]);
      }else{
        state='false';
        await AsyncStorage.multiSet([['ESTADO', state],['TIME_INACTIVO_INIT',time]]);
        await AsyncStorage.removeItem('TIME_INACTIVO');
      }
      this.setState({estado: estado2});
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    return (
      <Container>
        <Content>
            <View style={{width:"100%", height:Dimensions.get('window').height, paddingLeft:20, paddingRight:20}}>
                <View style={styles.header}>
                    <TouchableOpacity style={{marginLeft:20, marginTop:30}} onPress={() => this.props.drawer._root.close()}>
                        <Icon ios="ios-menu" android="md-menu" style={{fontSize: 40, color: 'white'}}></Icon>
                    </TouchableOpacity>
                </View>

                <View style={styles.threeButtons}>
                    <View style={[styles.rectangulo, styles.actividades]}>
                        <TouchableOpacity style={{flex:1,justifyContent:'center'}} onPress={() => this.props.handler2(1,token,[])}>
                            <Text style={[styles.text]}>Actividad</Text>
                            <Image source={Imagen.actividad} style={{width:"90%",height:"90%"}}></Image>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.columnas}>
                        <View style={[styles.cuadradoInsideColumna, styles.perfil]}>
                            <TouchableOpacity style={{flex:1,justifyContent:'center'}} onPress={() => this.props.handler2(5,token,this.props.user)}>
                                <Text style={[styles.text]}>Perfil</Text>
                                <Image source={Imagen.perfil} style={{width:"90%",height:"90%"}}></Image>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.cuadradoInsideColumna, styles.agenda]}>
                            <TouchableOpacity style={{flex:1,justifyContent:'center'}} onPress={() => this.props.handler2(3,token,[])}>
                                <Text style={[styles.text]}>Agenda</Text>
                                <Image source={Imagen.agenda} style={{width:"90%",height:"90%"}}></Image>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                
                <View style={styles.twoButtons}>
                    <View style={[styles.cuadrado,styles.activo]}>
                        <TouchableOpacity style={{flex:1,justifyContent:'center'}} onPress={() => {this._storeData(!this.state.estado); this.props._retrieveData()}}>
                            {
                                this.state.estado === true ?
                                <View>
                                    <Text style={[styles.text]}>Activo</Text>
                                    <Image source={Imagen.activo} style={{width:"90%",height:"90%"}}></Image>
                                </View>
                                :
                                <View>
                                    <Text style={[styles.text]}>Inactivo</Text>
                                    <Image source={Imagen.inactivo} style={{width:"90%",height:"90%"}}></Image>
                                </View>
                            }
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.rectangulo,styles.completado85]}>
                        <TouchableOpacity style={{flex:1,justifyContent:'center'}} onPress={() => console.log("completado")}>
                            <Text style={[styles.text]}>80%</Text>
                            <Text style={[styles.text]}>Completado</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                <View style={styles.oneButton}>
                    <View style={styles.reportes}>
                        <TouchableOpacity style={{flex:1,justifyContent:'center'}} onPress={() => this.props.handler2(-1,token,[])}>
                            <Text style={[styles.text]}>Reportes</Text>
                            <Image source={Imagen.reportes} style={{width:"50%",height:"90%"}}></Image>
                        </TouchableOpacity>
                    </View>
                </View>
                
                <View style={styles.twoButtons}>
                    <View style={[styles.rectangulo,styles.servicioTecnico]}>
                        <TouchableOpacity style={{flex:1,justifyContent:'center'}} onPress={() => this.props.handler2(-1,token,[])}>
                            <Text style={[styles.text]}>Servicio Tecnico</Text>
                            <Image source={Imagen.servicioTecnico} style={{width:"90%",height:"90%"}}></Image>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.cuadrado,styles.cerrarSesion]}>
                        <TouchableOpacity style={{flex:1,justifyContent:'center'}} onPress={() => this.props.handler2(-1,token,[])}>
                            <Text style={[styles.text]}>Cerrar Sesion</Text>
                            <Image source={Imagen.cerrarSesion} style={{width:"90%",height:"90%"}}></Image>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Content>
      </Container>
    );
  }
}