import { StyleSheet } from 'react-native';
import { COLOR } from '../components/Colores';
export default StyleSheet.create({
    form: {
        borderColor: 'rgba(255,255,255,0)',
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 10
    },
    separador:{
        alignContent:'center',
        borderRightWidth:1,
        borderRightColor: COLOR.azul,
        height:45,
        marginLeft:8,
        marginRight:-8,
        marginTop:'auto',
        marginBottom:'auto'
    },
    separadorSucursales:{
        flex:1,
        height:1,
        backgroundColor:'#afafaf44',
        marginTop: 40,
        elevation:4,
        shadowOffset:{height:5}
    },
    ConBorde:{
        backgroundColor: "rgba(255,255,255,0)",
        marginBottom: 15   
    },
    SinBorde:{
        borderBottomColor: 'rgba(255,255,255,0)',
        paddingTop: 5,
        paddingBottom:5
    },
    perfil:{
        position: 'absolute',
        left: -10,
        top: -5
    },
    activo:{
        color: COLOR.verde,
        left:30,
        top:40
    },
    inactivo:{
        color: COLOR.rojo,
        left:30,
        top:40
    },
    text:{
        fontFamily:'BebasKai',
        color: COLOR.azul,
        fontSize: 24
    },
    text2:{
        fontFamily:'BebasKai',
        color: COLOR.azul,
        fontSize: 20
    },
    sucursalText:{
        fontFamily:'BebasNeueBold',
        color: COLOR.azul,
        fontSize: 28
    },
    ActividadText:{
        fontFamily:'BebasNeueBold',
        color: 'white',
        fontSize: 20,
        textAlign:'center'
    },
    ActividadBackground:{
        backgroundColor: COLOR.azul,
        borderRadius:10,
        justifyContent:'center',
        alignItems:'center',
        flex:1,
        height:40
    },
    prioridad:{
        borderRadius:10,
        justifyContent:'center',
        alignItems:'center',
        width:60,
        height:40
    }
});