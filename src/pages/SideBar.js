import React from "react";
import { Image, View, TouchableOpacity, Dimensions, AsyncStorage } from "react-native";
import { Text, Container, Content, Badge} from "native-base";
import styles from '../styles/SideBar';
import IconStyles from '../styles/Icons';
import { Imagen } from "../components/Imagenes";

export default class SideBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            estado: true,
            porcentaje:0,
            porcentajes:{},
            cant_reportes:'0'
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
      const value = await AsyncStorage.multiGet(['ESTADO','PORCENTAJE','PORCENTAJES','CANT_REPORTES']);
      if (value !== null) {
        var state;
        var porcentaje = 0;
        var porcentajes = {};
        var cant = '0';
        if(value[0][1] === 'true'){state=true}else{state=false}
        if(value[1][1] !== null){porcentaje = value[1][1]}
        if(value[2][1] !== null){porcentajes = JSON.parse(value[2][1])}
        if(value[3][1] !== null){cant = value[3][1]}
        //console.log(value[1][1]);
        this.setState({estado : state, porcentaje: porcentaje, porcentajes:porcentajes,cant_reportes:cant});
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
                    <TouchableOpacity style={{marginLeft:20, marginTop:30}} onPress={() => this.props.closeDrawer()}>
                        {/* <Icon ios="ios-menu" android="md-menu" style={{fontSize: 40, color: 'white'}}></Icon> */}
                        <Image style={IconStyles.menu2} source={Imagen.home}></Image>
                    </TouchableOpacity>
                </View>

                <View style={styles.threeButtons}>
                    <View style={[styles.rectangulo, styles.actividades, this.props.layout === 1 ?{shadowOffset:{height:8}, elevation: 8} : null]}>
                        <TouchableOpacity style={{flex:1,justifyContent:'space-between', alignItems:'center'}} onPress={() => {this.props.layout === 1 ? this.props.closeDrawer() : this.props.handler2(1,token,[])}} disabled={this.props.rol === 4 ? true : false}>
                            <Text style={[styles.text,{fontSize:34, paddingTop:20}]}>Actividad</Text>
                            <Image source={Imagen.actividad} style={{width:"50%",height:"50%",marginBottom:20}}></Image>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.columnas}>
                        <View style={[styles.cuadradoInsideColumna, styles.perfil, this.props.layout === 5 ?{shadowOffset:{height:8}, elevation: 8} : null]}>
                            <TouchableOpacity style={{flex:1,justifyContent:'space-between', alignItems:'center'}} onPress={() => {this.props.layout === 5 ? this.props.closeDrawer() : this.props.handler2(5,token,[])}}>
                                <Text style={[styles.text,{paddingTop:10}]}>Perfil</Text>
                                <Image source={Imagen.perfil} style={{width:"60%",height:"60%",marginBottom:10}}></Image>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.cuadradoInsideColumna, styles.agenda, this.props.layout === 3 ?{shadowOffset:{height:8}, elevation: 8} : null]}>
                            <TouchableOpacity style={{flex:1,justifyContent:'space-between', alignItems:'center'}} onPress={() => {this.props.layout === 3 ? this.props.closeDrawer() : this.props.handler2(3,token,[])}} disabled={this.props.rol === 4 ? true : false}>
                                <Text style={[styles.text,{paddingTop:5}]}>Agenda</Text>
                                <Image source={Imagen.agenda} style={{width:"50%",height:"50%",marginBottom:10}}></Image>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                
                <View style={styles.twoButtons}>
                    <View style={[styles.cuadrado,styles.activo]}>
                        <TouchableOpacity style={{flex:1,justifyContent:'center'}} onPress={() => {this._storeData(!this.state.estado); this.props.layout === 1 ? this.props._retrieveData() : null}} disabled={this.props.rol === 4 ? true : false}>
                            {
                                this.state.estado === true ?
                                <View>
                                    <Text style={[styles.text]}>Activo</Text>
                                    <Image source={Imagen.activo} style={{width:"40%",height:"65%", alignSelf:'center'}}></Image>
                                </View>
                                :
                                <View>
                                    <Text style={[styles.text]}>Inactivo</Text>
                                    <Image source={Imagen.inactivo} style={{width:"40%",height:"65%", alignSelf:'center'}}></Image>
                                </View>
                            }
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.rectangulo, this.props.layout === 7 ?{shadowOffset:{height:8}, elevation: 8} : null,
                            this.state.porcentaje <= 10 ?
                                styles.completado10
                            :
                                this.state.porcentaje <= 20 ?
                                    styles.completado20
                                :
                                    this.state.porcentaje <= 30 ?
                                        styles.completado30
                                    :
                                        this.state.porcentaje <= 40 ?
                                            styles.completado40
                                        :
                                            this.state.porcentaje <= 50 ?
                                                styles.completado50
                                            :
                                                this.state.porcentaje <= 60 ?
                                                    styles.completado60
                                                :
                                                    this.state.porcentaje <= 70 ?
                                                        styles.completado70
                                                    :
                                                        this.state.porcentaje <= 85 ?
                                                            styles.completado85
                                                        :
                                                            this.state.porcentaje <= 99 ?
                                                                styles.completado99
                                                            :
                                                                styles.completado100

                        ]}>
                        <TouchableOpacity style={{flex:1,justifyContent:'center'}} onPress={() => {this.props.layout === 7 ? this.props.closeDrawer() : this.props.handler2(7,token,this.state.porcentajes)}} disabled={this.props.rol === 4 ? true : false}>
                            <Text style={[styles.text,{fontSize:34}]}>{this.state.porcentaje}%</Text>
                            <Text style={[styles.text,{fontSize:28}]}>Completado</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                <View style={styles.oneButton}>
                    <View style={[styles.reportes, this.props.layout === 8 ?{shadowOffset:{height:8}, elevation: 8} : null]}>
                        <TouchableOpacity style={{flex:1,justifyContent:'space-between', flexDirection:'row', alignItems:'center'}} onPress={() => {this.props.layout === 8 ? this.props.closeDrawer() : this.props.handler2(8,token,[])}}>
                            <Text style={[styles.text,{fontSize:40,marginLeft:30}]}>Reportes</Text>
                            <Image source={Imagen.reportes} style={{width:"25%",height:"75%",marginRight:30}}></Image>
                            {this.state.cant_reportes !== '0' && <Badge style={{position:'absolute', left:"95%"}}>
                                <Text>{this.state.cant_reportes}</Text>
                            </Badge>}
                        </TouchableOpacity>
                    </View>
                </View>
                
                <View style={styles.twoButtons}>
                    <View style={[styles.rectangulo,styles.servicioTecnico, this.props.layout === 9 ?{shadowOffset:{height:8}, elevation: 8} : null]}>
                        <TouchableOpacity style={{flex:1,justifyContent:'space-between', flexDirection:'row', alignItems:'center'}} onPress={() => {this.props.layout === 9 ? this.props.closeDrawer() : this.props.handler2(9,token,[])}}>
                            <Text style={[styles.text, {height:"80%",width:"50%", fontSize:28, marginLeft:20}]}>Soporte Técnico</Text>
                            <Image source={Imagen.servicioTecnico} style={{width:"25%",height:"75%",marginRight:20}}></Image>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.cuadrado,styles.cerrarSesion]}>
                        <TouchableOpacity style={{flex:1,justifyContent:'center', alignItems:'center'}} onPress={() => {/*clearTimeout(localNotification);*/ this.props.handler2(-1,token,[])}}>
                            <Text style={[styles.text,{fontSize:16}]}>Cerrar Sesión</Text>
                            <Image source={Imagen.cerrarSesion} style={{width:"45%",height:"55%"}}></Image>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Content>
      </Container>
    );
  }
}