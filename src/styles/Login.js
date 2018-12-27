import { StyleSheet } from 'react-native';
export default StyleSheet.create({
    form: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderColor: '#FFF',//rgba(255,255,255,0)
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
        borderColor: 'rgba(255,255,255,0)',
        borderRadius: 10,
        height: 40
    },
    input:{
        color: 'white',
        borderLeftWidth: 1,
        borderLeftColor: '#FFF',
        height: 37
    },
    icon:{
        color: 'white',
        width: 36
    },
    text:{
        fontSize: 16
    },
    checkbox:{
        backgroundColor: 'rgba(255,255,255,0)',
        borderColor: 'rgba(255,255,255,0)', 
        marginTop: -10
    },
    checkbox2:{
        backgroundColor: 'rgba(255,255,255,0)',
        borderColor: 'rgba(255,255,255,0)',
        marginLeft: 50,
        marginRight: 20,
        paddingTop:-5,
        paddingBottom:-5,
        marginBottom:5
    },
    forgotPass: {
        color: 'white',
        marginLeft: 'auto',
        marginRight: 'auto',
        textDecorationLine: 'underline',
        marginBottom:2
    }
});