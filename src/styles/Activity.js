import { StyleSheet } from 'react-native';
import { COLOR } from '../components/Colores';
export default StyleSheet.create({
    sucursal:{
        fontFamily:'BebasNeueBold',
        color: COLOR.azul,
        fontSize: 32,
        marginLeft:20,
        marginTop:10
    },
    actividad:{
        fontFamily:'BebasNeueBold',
        color: COLOR.azul,
        fontSize: 26,
        marginLeft:20,
        marginTop:15
    },
    boton: {
        borderColor: 'rgba(255,255,255,0)',
        borderRadius: 10,
        height: 40,
        marginLeft: 40,
        marginRight: 40,
        marginBottom:10
    },
    finalizar:{
        backgroundColor:COLOR.verde
    },
    actualizar:{
        backgroundColor:COLOR.azul
    },
    observaciones:{
        borderColor: COLOR.azulTransparente,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 5,
        marginTop: 10,
        textAlign: 'center',
        textAlignVertical: 'center',
        fontFamily:'BebasKai',
        color:COLOR.azul
    },
    textInfo:{
        margin:10,
        marginLeft:20,
        fontFamily:'BebasKai',
        color:COLOR.azul
    },
    textButton:{
        fontFamily:'BebasNeueBold',
        fontSize:20
    },
    descripcion:{
        color:'white',
        textAlign:'justify',
        fontFamily:'BebasKai'
    },
    textDocumento:{
        margin: 5,
        fontFamily:'BebasKai',
        color:COLOR.azul
    },
    textDescFoto:{
        color:COLOR.azul,
        textAlign:'justify',
        fontFamily:'BebasNeueBold'
    },
    picker:{
        fontFamily:'BebasKai',
        color:COLOR.azul
    },
    producto:{
        borderBottomWidth:1,
        borderBottomColor:COLOR.azul,
        fontFamily:'BebasNeueBold',
        fontSize:20,
    },
    productosList:{
        marginLeft:3,
        fontFamily:'BebasKai',
        color:COLOR.azul
    },
    autocompletar:{
        borderColor:COLOR.azul,
        borderLeftWidth:1,
        borderRightWidth:1,
        borderTopWidth:1,
        borderBottomWidth:1,
        borderRadius:4,
        marginLeft:20,
        marginRight:20
    },
    autocompletarLista:{
        marginLeft:25,
        marginRight:25,
        borderColor:COLOR.azul
    },
    iconoBoton:{
        height:21,
        width:21
    }
});