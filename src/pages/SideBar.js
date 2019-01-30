import React from "react";
import { AppRegistry, Image, StatusBar, View, TouchableOpacity } from "react-native";
import { Button, Text, Container, ListItem, Content, Separator} from "native-base";
import { COLOR } from "../components/Colores";

export default class SideBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        let token = this.props.token;
        console.ignoredYellowBox = ['Require cycle:'];
  }
  render() {
    return (
      <Container>
        <Content>
            <View style={{width:"100%", height:600, paddingLeft:20, paddingRight:20}}>
                <View style={{backgroundColor:COLOR.azul, width:"115%", borderBottomRightRadius:100, height:78, marginLeft:-20}}></View>

                <View style={{width:"100%", height:"25%", flexDirection:'row', justifyContent:'space-between', marginTop:20}}>
                    <View style={{backgroundColor:'#00645C', width:"53%", height:"100%", borderRadius:10}}><TouchableOpacity style={{flex:1}} onPress={() => console.log("actividades")}></TouchableOpacity></View>
                    <View style={{width:"100%", height:"100%", flexDirection:'column', justifyContent:'space-between', marginLeft:10}}>
                        <View style={{backgroundColor:'#8CD7DF', width:"30%", height:"48%", borderRadius:10}}><TouchableOpacity style={{flex:1}} onPress={() => this.props.handler2(5,token,this.props.user)}></TouchableOpacity></View>
                        <View style={{backgroundColor:'#0E303F', width:"30%", height:"48%", borderRadius:10}}><TouchableOpacity style={{flex:1}} onPress={() => this.props.handler2(3,token,[])}></TouchableOpacity></View>
                    </View>
                </View>
                
                <View style={{width:"100%", height:"13%", flexDirection:'row', justifyContent:'space-between', marginTop:10}}>
                    <View style={{backgroundColor:'#8CD7DF', width:"30%", height:"100%", borderRadius:10}}><TouchableOpacity style={{flex:1}} onPress={() => this.props.handler2(-1,token,[])}></TouchableOpacity></View>
                    <View style={{backgroundColor:'#46D116', width:"65%", height:"100%", borderRadius:10}}><TouchableOpacity style={{flex:1}} onPress={() => this.props.handler2(-1,token,[])}></TouchableOpacity></View>
                </View>
                
                <View style={{width:"100%", height:"15%", flexDirection:'row', justifyContent:'space-between', marginTop:10}}>
                    <View style={{backgroundColor:'#5A8B91', width:"100%", height:"100%", borderRadius:10}}><TouchableOpacity style={{flex:1}} onPress={() => this.props.handler2(-1,token,[])}></TouchableOpacity></View>
                </View>
                
                <View style={{width:"100%", height:"13%", flexDirection:'row', justifyContent:'space-between', marginTop:10}}>
                    <View style={{backgroundColor:'#476800', width:"65%", height:"100%", borderRadius:10}}><TouchableOpacity style={{flex:1}} onPress={() => this.props.handler2(-1,token,[])}></TouchableOpacity></View>
                    <View style={{backgroundColor:'#7EB700', width:"30%", height:"100%", borderRadius:10}}><TouchableOpacity style={{flex:1}} onPress={() => this.props.handler2(-1,token,[])}></TouchableOpacity></View>
                </View>
            </View>
        </Content>
      </Container>
    );
  }
}