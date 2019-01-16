import React, { Component } from 'react';
import { Left, Right, ListItem,Text,Radio } from 'native-base';

export class RadioButton extends Component {
    constructor(props) {
      super(props);
    }

    render() {
        return (
            <ListItem button onPress={() => this.props.SetChecked(this.props.i,this.props.value)} style={{borderBottomColor: 'rgba(255,255,255,0)'}}>
                <Left>
                    <Text>{this.props.value}</Text>
                </Left>
                <Right>                    
                {
                    this.props.checked === this.props.i ?                        
                        <Radio selected={true} onPress={() => this.props.SetChecked(this.props.i,this.props.value)}/>
                    :
                        <Radio selected={false} onPress={() => this.props.SetChecked(this.props.i,this.props.value)}/>
                }
                </Right>
            </ListItem>
        );
    }
}