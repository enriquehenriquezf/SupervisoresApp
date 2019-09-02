/**
 * @author Enrique Henriquez Figueroa
 * @copyright Binar10
 */
import { StyleSheet } from 'react-native';
import { COLOR } from '../components/Colores';
export default StyleSheet.create({
    text:{
        fontFamily:'BebasNeueBold',
        textAlign:'center',
        color:'white',
        fontSize: 20
    },
    observaciones:{
        borderColor: COLOR.azulTransparente,
        borderRadius:10,
        borderWidth: 1,
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 5,
        marginTop: 10,
        textAlign: 'center',
        textAlignVertical: 'center',
        fontFamily:'BebasKai',
        color:COLOR.azul
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
        backgroundColor:COLOR.azul
    },
    actualizar:{
        backgroundColor:COLOR.secundary
    },
    textButton:{
        fontFamily:'BebasNeueBold',
        fontSize:20
    },
    iconoBoton:{
        height:21.33,
        width:21.33
    },
    SinBorde:{
        borderBottomColor: 'rgba(255,255,255,0)',
        paddingTop: 5,
        paddingBottom:5
    },
    asunto:{
        color: COLOR.azul,
        fontSize: 20,
        borderColor:COLOR.azul,
        borderWidth:1,
        borderRadius:10,
        height:40,
        marginBottom:10,
        flex:null,
    },
    ReporteText:{
        fontFamily:'BebasNeueBold',
        color: 'white',
        fontSize: 20,
        alignSelf:'flex-start',
        textAlign:'left',
        paddingLeft:20
    },
    ReporteBackground:{
        backgroundColor: COLOR.azul,
        borderRadius:10,
        justifyContent:'center',
        alignItems:'center',
        width:"80%",
        height:40
    },
    estado:{
        borderRadius:10,
        justifyContent:'center',
        alignItems:'center',
        width:40,
        height:40
    },
    producto:{
        borderBottomWidth:1,
        borderBottomColor:COLOR.azul,
        fontFamily:'BebasNeueBold',
        fontSize:20,
        height:30
    },
    autocompletar:{
        borderColor:COLOR.azul,
        borderWidth:1,
        borderRadius:4,
        marginLeft:20,
        marginRight:20,
        marginBottom:10,
    },
    autocompletarLista:{
        marginLeft:25,
        marginRight:25,
        borderColor:COLOR.azul
    },
});