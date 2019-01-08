import { StyleSheet } from 'react-native';
import {Platform} from 'react-native';
export default StyleSheet.create({
    header: {
        fontSize: 20,
        color: Platform.OS === 'ios' ? 'black' : 'white'
    },
    help: {
        fontSize: Platform.OS === 'ios' ? 30 : 20,
        color: Platform.OS === 'ios' ? 'black' : 'white'
    },
    back: {
        marginLeft: Platform.OS === 'ios' ? 5 : 0
    },
    estado:{
        flex:1,
        flexDirection:'row',
        justifyContent:'flex-end',
        alignItems:'center'
    },
    activo:{
        color: "#5cb85c",
        fontSize:20
    },
    inactivo:{
        color: "#d9534f",
        fontSize:20
    },
    dropdown:{
        color: Platform.OS === 'ios' ? 'black' : 'white',
        marginRight: 5
    }
});