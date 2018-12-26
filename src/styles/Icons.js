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
    }
});