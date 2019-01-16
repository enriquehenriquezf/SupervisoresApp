import React, { Component } from 'react';
import { Left, Body, Right, List,ListItem,Text, Icon, Thumbnail, Card } from 'native-base';
import {View} from 'react-native';
import styles from '../styles/Home';
import {Imagen} from './Imagenes';

export class UserInfo extends Component {
    constructor(props) {
      super(props);
      this._OnItemPress = this._OnItemPress.bind(this);
    }

    /**
     * Cambiar al Layout activity al presionar el Item y enviarle los datos de ese item
     * @param {function} handler 
     * @param {Array} item 
     */
    _OnItemPress(index,handler, item)
    {
        handler(index,token,item);
    }

    render() {
        return (
            <Card style={{borderRadius: 5}}>
                <List>
                    <ListItem thumbnail button style={{marginBottom: 5}} onPress={() => this._OnItemPress(5,this.props.handler2, this.props.user)}>
                    <Left>
                        <View style={{marginRight: 30}}>
                        <Thumbnail source={{ uri: Imagen.avatar }} style={styles.perfil} />
                        {this.props.estado === 'true' ?
                            <Icon active ios='ios-checkmark-circle' android='md-checkmark-circle' style={styles.activo}/>
                            :
                            <Icon active ios='ios-remove-circle' android='md-remove-circle' style={styles.inactivo}/>
                        }
                        </View>
                        <View style={styles.separador}></View>
                    </Left>
                    <Body style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                        <Text>{this.props.user.nombre} {this.props.user.apellido}</Text>
                        <Text note>{this.props.user.cedula}</Text>
                    </Body>
                    <Right style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                        <Text note>{this.props.user.codigo}</Text>
                    </Right>
                    </ListItem>
                </List>
            </Card>
        );
    }
}