import React, { Component } from 'react';
import { Left, Right, ListItem,Text,Radio } from 'native-base';
import { COLOR } from './Colores';

export class RadioButton extends Component {
    constructor(props) {
      super(props);
    }

    render() {
        return (
            <ListItem button onPress={() => this.props.SetChecked(this.props.i,this.props.value)} style={{backgroundColor:COLOR.verde,borderRadius:10,borderBottomColor: 'rgba(255,255,255,0)'}}>
                <Left>
                    <Text style={{color:'white', fontFamily:'BebasNeueBold', fontSize:20}}>{this.props.value}</Text>
                </Left>
                <Right>                    
                {
                    this.props.checked === this.props.i ?                        
                        <Radio color='white' selected={true} onPress={() => this.props.SetChecked(this.props.i,this.props.value)}/>
                    :
                        <Radio color='white' selected={false} onPress={() => this.props.SetChecked(this.props.i,this.props.value)}/>
                }
                </Right>
            </ListItem>
        );
    }
}