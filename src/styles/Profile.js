import { StyleSheet } from 'react-native';
import { COLOR } from '../components/Colores';
export default StyleSheet.create({
    boton: {
        backgroundColor:COLOR.azul,
        borderColor: 'rgba(255,255,255,0)',
        borderRadius: 10,
        height: 40,
        marginLeft: 40,
        marginRight: 40,
        marginTop: 15,
        marginBottom:10
    },
    boton2: {
        borderColor: 'rgba(255,255,255,0)',
        backgroundColor: COLOR.verde,
        borderRadius: 10,
        height: 40,
        marginLeft: 50,
        marginRight: 50,
        marginTop: 10,
        marginBottom:10
    },
    text: {
        padding: 5,
        color:COLOR.azul,
        fontFamily:'BebasKai',
        fontSize:18,
        borderLeftWidth:2,
        borderColor: COLOR.azulTransparente
    },
    textH2: {
        marginTop: 10,
        marginBottom: 15,
        color:COLOR.azul,
        fontFamily:'BebasKai',
        marginLeft:'auto',
        marginRight:'auto'
    },
    textoBoton:{
        color:'white',
        fontFamily:'BebasNeueBold',
        fontSize:20
    },
    item:{
        borderLeftWidth:2,
        borderRightWidth:2,
        borderTopWidth:2,
        borderBottomWidth:2,
        borderColor: COLOR.azulTransparente,
        borderRadius:8,
        marginTop:10
    },
    input:{
        color: COLOR.azul,
        borderLeftWidth: 2,
        borderLeftColor: COLOR.azulTransparente,
        height: 30,
        fontFamily:'BebasKai'
    },
    foto:{
        marginTop:10,
        marginLeft:'auto',
        marginRight:'auto',
        borderWidth:4,
        borderColor:COLOR.azul,
        width: 160,
        height: 160,
        borderRadius:80
    },
    icono:{
        width:21,
        height:21,
        margin:4
    }
});