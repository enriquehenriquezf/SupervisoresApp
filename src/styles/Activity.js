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
        marginRight: 40
    },
    observaciones:{
        borderColor: '#29B6F6',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 5,
        marginTop: 20,
        textAlign: 'center',
        textAlignVertical: 'center'
    }
});