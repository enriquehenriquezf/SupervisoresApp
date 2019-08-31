/**
 * @author Enrique Henriquez Figueroa
 * @copyright Binar10
 */
import { StyleSheet } from 'react-native';
import {Platform} from 'react-native';
import { COLOR } from '../components/Colores';
export default StyleSheet.create({
    gradient:{
        // paddingTop: 50,
        // paddingBottom:30,
        height:"12.5%",
        elevation:0,
        borderBottomRightRadius:100,
    },
    navbar:{
        paddingTop: 50,
        paddingBottom:30,
        // height:"10%",
        // elevation:0,
        // borderBottomRightRadius:100,
        backgroundColor:'transparent'
    },
    menu: {
        fontSize: 40,
        color: 'white'
    },
    menu2: {
        width: 40,
        height: 40
    },
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
});