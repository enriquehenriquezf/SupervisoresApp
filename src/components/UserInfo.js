import React, { Component } from 'react';
import { Left, Body, Right, List,ListItem,Text, Icon, Thumbnail, Card } from 'native-base';
import {View, Image} from 'react-native';
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
            <Card style={{borderColor:'rgba(255,255,255,0)', elevation:0}}>
                <List>
                    <ListItem thumbnail button style={{marginBottom: 5}} onPress={() => this._OnItemPress(5,this.props.handler2, this.props.user)}>
                    <Left>
                        <View style={{marginRight: 30}}>
                        <Thumbnail square source={Imagen.profileBorder} style={styles.perfil}/>
                        {
                            this.props.user.foto !== undefined ?
                            (
                                this.props.user.foto.includes("../") ?
                                    null
                                :
                                    <Thumbnail source={{ uri: this.props.user.foto }} style={styles.perfil} />/* Imagen.avatar */
                            )
                            :
                                null
                        }
                        {this.props.estado === 'true' ?
                            <Icon active ios='ios-checkmark-circle' android='md-checkmark-circle' style={styles.activo}/>
                            :
                            <Icon active ios='ios-remove-circle' android='md-remove-circle' style={styles.inactivo}/>
                        }
                        </View>
                        <View style={styles.separador}></View>
                    </Left>
                    <Body style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                        <Text style={styles.text}>{this.props.user.nombre} {this.props.user.apellido}</Text>
                        <Text style={styles.text2}>{this.props.user.cedula}</Text>
                    </Body>
                    <Right style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                        <Text note style={styles.text2}>{this.props.user.codigo}</Text>
                    </Right>
                    </ListItem>
                </List>
            </Card>
        );
    }
}