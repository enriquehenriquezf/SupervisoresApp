import { StyleSheet } from 'react-native';
import {Platform} from 'react-native';
export default StyleSheet.create({
    header: {
        fontSize: 40,
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
        fontSize:20,
        marginRight: 5,
        marginTop: Platform.OS === 'ios' ? 0 : 6
    },
    StateTitle:{
        marginLeft: Platform.OS === 'ios' ? 2 : 5,
        marginRight:5
    }
});