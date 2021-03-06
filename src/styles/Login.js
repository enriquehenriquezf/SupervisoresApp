/**
 * @author Enrique Henriquez Figueroa
 * @copyright Binar10
 */
import { StyleSheet, Dimensions } from 'react-native';
import { COLOR } from '../components/Colores';
var widthScreen = Dimensions.get('window').width;
export default StyleSheet.create({
    form: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderColor: COLOR.azulTransparente,//rgba(255,255,255,0)
        borderBottomWidth: 2,
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderTopWidth: 2,
        borderRadius: 10,
        height: 40,
        marginBottom: 10,
        marginLeft: 20,
        marginRight: 20
    },
    boton: {
        borderColor: 'rgba(255,255,255,0)',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        height: 40,
        marginLeft: 50,
        marginRight: 50,
        marginTop: 10
    },
    boton2: {
        backgroundColor: COLOR.secundary,
        borderColor: 'rgba(255,255,255,0)',
        elevation:0,
        borderWidth:0,
        borderRadius: 10,
        height: 40,
        marginLeft: 50,
        marginRight: 50,
        marginTop: 15
    },
    input:{
        color: COLOR.azul,
        borderLeftWidth: 2,
        borderLeftColor: COLOR.azulTransparente,
        height: 37,
        fontFamily:'BebasKai'
    },
    pass:{
        color: COLOR.azul,
        borderLeftWidth: 2,
        borderLeftColor: COLOR.azulTransparente,
        height: 37,
    },
    icon:{
        width:24,
        height:24,
        margin:7
    },
    text:{
        fontSize: 20,
        fontFamily:'BebasNeueBold'
    },
    checkbox:{
        color:COLOR.azul,
        fontFamily:'BebasNeueBold'
    },
    checkbox2:{
        backgroundColor: 'rgba(255,255,255,0)',
        borderColor: 'rgba(255,255,255,0)',
        justifyContent:'center',
        marginLeft: widthScreen/4,
        marginRight: 20,
        paddingTop:-5,
        paddingBottom:-5,
        marginTop:15,
    },
    forgotPass: {
        color: COLOR.azul,
        marginLeft: 'auto',
        marginRight: 'auto',
        textDecorationLine: 'underline',
        fontFamily:'BebasNeueBold',
        marginBottom:2,
        marginTop:5
    }
});